#!/usr/bin/env bash
#
# Prepares a bare VPS to host the workflow and the deployed environments.
#
#   scp bootstrap-vps.sh root@<ip>:/root/
#   ssh root@<ip> 'bash /root/bootstrap-vps.sh <admin-user>'
#
# Idempotent: running it twice changes nothing the second time. That matters because the
# first run of a bootstrap script is almost never the only one — something is missing, it
# is fixed, it runs again — and a script that only works on a pristine machine is a script
# nobody trusts to re-run.
#
# It does NOT deploy anything. It installs Docker, hardens access, creates the networks and
# the directories, and stops. Deployment is the pipeline's job, or deploy.sh by hand.

set -Eeuo pipefail

readonly ADMIN_USER="${1:-deploy}"

log()  { printf '\n\033[1;32m==>\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33m[!]\033[0m %s\n' "$*" >&2; }
die()  { printf '\033[1;31m[x]\033[0m %s\n' "$*" >&2; exit 1; }

[[ $EUID -eq 0 ]] || die "run as root"

# --------------------------------------------------------------- 0. what we are on
log "Machine"
echo "  $(. /etc/os-release && echo "$PRETTY_NAME")"
echo "  $(nproc) vCPU, $(free -g | awk '/^Mem:/ {print $2}') Go de RAM, $(df -h / | awk 'NR==2 {print $2}') de disque"

TOTAL_RAM_GB=$(free -g | awk '/^Mem:/ {print $2}')
if (( TOTAL_RAM_GB < 15 )); then
  # Stated rather than silently ignored. CST D.3 sizes the full stack at 32 GB, viable at
  # 16. Below that, the workflow and the three environments do not fit on one machine, and
  # the documented answer is to split them across two hosts — which also has a merit of its
  # own: saturating the build agents can no longer degrade a client's production.
  warn "RAM below the 16 GB the CST calls a viable minimum."
  warn "Do not run the workflow AND the three environments here. See CST D.3."
fi

# -------------------------------------------------------------------- 1. packages
log "Base packages"
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq \
  ca-certificates curl gnupg ufw fail2ban unattended-upgrades \
  age rclone jq git htop >/dev/null

# Security updates apply themselves. An unpatched kernel on a public host is not a risk
# worth carrying for the convenience of choosing when to reboot.
dpkg-reconfigure -f noninteractive unattended-upgrades

# ---------------------------------------------------------------------- 2. Docker
if ! command -v docker >/dev/null; then
  log "Docker"
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/debian/gpg \
    | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
https://download.docker.com/linux/debian $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
    > /etc/apt/sources.list.d/docker.list
  apt-get update -qq
  apt-get install -y -qq docker-ce docker-ce-cli containerd.io \
    docker-buildx-plugin docker-compose-plugin >/dev/null
else
  log "Docker already installed: $(docker --version)"
fi

# Container logs are capped at the DAEMON level, not only per compose file. The default
# json-file driver has no limit, and the first symptom is a full disk — which looks like a
# dozen unrelated failures before anyone thinks to run `df`.
cat > /etc/docker/daemon.json <<'EOF'
{
  "log-driver": "json-file",
  "log-opts": { "max-size": "10m", "max-file": "3" },
  "live-restore": true
}
EOF
systemctl restart docker

# ------------------------------------------------------------------ 3. admin user
if ! id "$ADMIN_USER" >/dev/null 2>&1; then
  log "User ${ADMIN_USER}"
  adduser --disabled-password --gecos '' "$ADMIN_USER"
  usermod -aG docker,sudo "$ADMIN_USER"

  # The root key is copied over so the new account is usable BEFORE root login is closed
  # below. Doing it the other way round locks everyone out of a machine that is now only
  # reachable through a provider console.
  if [[ -f /root/.ssh/authorized_keys ]]; then
    install -d -m 700 -o "$ADMIN_USER" -g "$ADMIN_USER" "/home/${ADMIN_USER}/.ssh"
    install -m 600 -o "$ADMIN_USER" -g "$ADMIN_USER" \
      /root/.ssh/authorized_keys "/home/${ADMIN_USER}/.ssh/authorized_keys"
  else
    warn "No /root/.ssh/authorized_keys: add a key for ${ADMIN_USER} BEFORE the next step."
  fi
fi

# --------------------------------------------------------------------- 4. SSH
log "SSH hardening"
cat > /etc/ssh/sshd_config.d/99-hardening.conf <<EOF
# Keys only. A public VPS sees password attempts within minutes of being allocated, and a
# password is the one credential that can be guessed.
PasswordAuthentication no
KbdInteractiveAuthentication no
PermitRootLogin prohibit-password
AllowUsers ${ADMIN_USER}
X11Forwarding no
MaxAuthTries 3
ClientAliveInterval 300
EOF

# Validated before restarting. A syntax error in sshd_config takes the host offline for
# good: the daemon refuses to start, and the only way back is the provider's console.
sshd -t || die "sshd config invalid — NOT restarting. Fix /etc/ssh/sshd_config.d/99-hardening.conf"
systemctl reload ssh

# -------------------------------------------------------------------- 5. firewall
log "Firewall"
ufw --force reset >/dev/null
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp    comment 'SSH'
ufw allow 80/tcp    comment 'HTTP, redirects to HTTPS'
ufw allow 443/tcp   comment 'HTTPS'
ufw allow 2222/tcp  comment 'Gitea SSH'
# Nothing else. PostgreSQL, Redis, Prometheus, Grafana and the registry are reached through
# the internal Docker networks or through Traefik. Opening 5432 "just for a quick look" is
# how a database ends up in a public scan.
ufw --force enable

# fail2ban on SSH. Keys-only already makes guessing pointless; this stops the log noise and
# the wasted CPU of thousands of daily attempts.
systemctl enable --now fail2ban

# ------------------------------------------------------- 6. networks and layout
log "Docker networks"
# `edge` is shared: Traefik lives in the workflow stack, the environments attach to it.
# Created here, once, so neither compose file owns it — whichever ran second would fail.
docker network inspect edge >/dev/null 2>&1 || docker network create edge
docker network inspect theetiptop-edge >/dev/null 2>&1 || docker network create theetiptop-edge

log "Directories"
install -d -m 755 /opt/theetiptop
install -d -m 755 /opt/theetiptop/backup
install -d -m 700 /etc/theetiptop
install -d -m 700 /etc/theetiptop/alerting
install -d -m 755 /var/backups/theetiptop/{daily,monthly}
install -d -m 755 /var/log/theetiptop
# Read by node_exporter's textfile collector: this is how the backup jobs report, and how a
# backup that stops running becomes an alert instead of a surprise during a restore.
install -d -m 755 /var/lib/node_exporter/textfile
chown -R "$ADMIN_USER:$ADMIN_USER" /opt/theetiptop /var/log/theetiptop

# ------------------------------------------------------------------- 7. swap
# A small swap file on a memory-tight host. Not a substitute for RAM: it is what turns "the
# OOM killer shot the database mid-write" into "the build was slow for ninety seconds".
if ! swapon --show | grep -q .; then
  log "Swap, 4 Go"
  fallocate -l 4G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile >/dev/null
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
  # Swap only under real pressure. The default of 60 would page out an idle container's
  # memory and make the next request slow for no reason.
  sysctl -w vm.swappiness=10 >/dev/null
  echo 'vm.swappiness=10' > /etc/sysctl.d/99-swappiness.conf
fi

# ------------------------------------------------------------------- 8. summary
log "Done"
cat <<EOF

  Docker      $(docker --version | cut -d, -f1)
  Compose     $(docker compose version --short)
  User        ${ADMIN_USER} (docker, sudo)
  Firewall    22, 80, 443, 2222 — everything else closed
  Networks    edge, theetiptop-edge
  SSH         keys only, root password login disabled

  Next, and in this order:

   1. Point the DNS records at $(curl -fsS --max-time 5 ifconfig.me 2>/dev/null || echo '<this IP>'):
        wk-archi-…      A, plus git. ci. registry. metrics.
        dsp5-archi-…    A, plus api. admin. (and dev./preprod. if deployed here)

      Before Traefik starts. Let's Encrypt validates over HTTP against the real name, so a
      certificate request made before DNS resolves fails and counts against the rate limit.

   2. Fill the secrets:
        /etc/theetiptop/backup.env
        /etc/theetiptop/alerting/{oncall-webhook,platform-webhook,smtp-password}
        05-workflow/.env.workflow
        05-workflow/docker/.env.prod

   3. Bring the workflow up, THEN the environments:
        docker compose -f 05-workflow/compose.workflow.yml --env-file .env.workflow up -d
        ./05-workflow/jenkins/scripts/deploy.sh prod <tag>

      Traefik lives in the workflow stack and owns ports 80 and 443. The environments
      attach to the network it created; starting them first leaves them unreachable.

EOF
