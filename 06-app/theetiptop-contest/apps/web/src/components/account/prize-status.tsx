import { Badge } from '../ui/badge';
import type { PrizeStatus } from '../../lib/mock';

const labels: Record<PrizeStatus, { text: string; tone: 'success' | 'warning' | 'neutral' }> = {
  TO_CLAIM: { text: 'À réclamer', tone: 'warning' },
  REDEEMED: { text: 'Remis', tone: 'success' },
  EXPIRED: { text: 'Expiré', tone: 'neutral' },
};

export function PrizeStatusBadge({ status }: { status: PrizeStatus }) {
  const { text, tone } = labels[status];
  return <Badge tone={tone}>{text}</Badge>;
}
