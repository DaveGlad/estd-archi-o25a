#!/usr/bin/env python3
"""
Builds the GanttProject file of the workflow project, from the tables of part H.

    python3 build-gan.py

Writes `workflow-furious-ducks.gan`, which GanttProject opens directly. The brief
allows MS Project or GanttProject and nothing else; `.gan` is GanttProject's own
format, plain XML, so it can be produced here and reviewed in a diff.

Why generate rather than type it in.

The 34 tasks, their durations, their predecessors and their costs are already
written out in `../sections/H-gantt.md`. Typing them a second time into a GUI
creates a second copy that drifts from the first, and nobody notices until the
totals stop matching. Here the table below is the only source, and the script
checks that its total lands on the figure the dossier announces before writing
anything.

Scheduling is ASAP, as the brief requires: GanttProject computes each start date
from the predecessors, so no date is written by hand except the project start.
"""

from __future__ import annotations

import datetime as dt
import pathlib
import xml.etree.ElementTree as ET

PROJECT_START = dt.date(2026, 9, 1)     # see the cover page, part A of the dossier
EXPECTED_TOTAL = 48_280                 # the figure announced in H.2 and I.1

# Daily rates from the TJM annex.
RATES = {'devops': 660.0, 'chef': 660.0, 'dev': 580.0}
RESOURCES = [
    (0, 'Ingénieur DevOps', 'devops'),
    (1, 'Développeur confirmé', 'dev'),
    (2, 'Chef de projet', 'chef'),
]

# (ref, name, duration in days, resource, predecessors, completion %)
#
# The completion column is required by the brief. The values are those of
# 21 November 2026: lots A to H are done, the documentation is under way, the
# training has not started.
TASKS = [
    ('A', "Cadrage et audit de l'existant", None, None, [], None),
    ('A.1', 'Entretiens avec les équipes, recensement des pratiques', 2, 'devops', [], 100),
    ('A.2', 'Inventaire des projets et de leurs contraintes', 2, 'devops', ['A.1'], 100),
    ('A.3', 'Choix des briques et validation en comité', 3, 'chef', ['A.2'], 100),

    ('B', 'Socle serveur et Docker', None, None, [], None),
    ('B.1', 'Commande du serveur et des noms de domaine', 1, 'devops', ['A.3'], 100),
    ('B.2', 'Installation, durcissement, filtrage réseau', 2, 'devops', ['B.1'], 100),
    ('B.3', 'Docker, réseaux cloisonnés, volumes', 1, 'devops', ['B.2'], 100),
    ('B.4', 'Reverse proxy, certificats, sous-domaines', 2, 'devops', ['B.3'], 100),

    ('C', 'SCM et conventions Git', None, None, [], None),
    ('C.1', 'Installation du SCM et des comptes', 2, 'devops', ['B.4'], 100),
    ('C.2', 'Modèle de branches et protections', 2, 'devops', ['C.1'], 100),
    ('C.3', 'Migration des dépôts existants', 2, 'dev', ['C.2'], 100),

    ('D', 'Jenkins, agents et registry', None, None, [], None),
    ('D.1', 'Installation de Jenkins et raccordement au SCM', 2, 'devops', ['C.2'], 100),
    ('D.2', 'Agents conteneurisés et jetables', 3, 'devops', ['D.1'], 100),
    ('D.3', 'Registry privé et politique de tags', 2, 'devops', ['D.2'], 100),
    ('D.4', 'Premier pipeline de bout en bout', 1, 'devops', ['D.3'], 100),

    ('E', 'Pipelines des trois types de projets', None, None, [], None),
    ('E.1', 'Pipeline site vitrine, minification et compression', 3, 'devops', ['D.4'], 100),
    ('E.2', 'Pipeline site administrable, tests et migrations', 4, 'devops', ['D.4'], 100),
    ('E.3', 'Pipeline application mobile hybride', 3, 'devops', ['D.4'], 100),
    ('E.4', 'Jenkinsfile de référence et documentation', 2, 'dev', ['E.1', 'E.2', 'E.3'], 100),
    ('E.5', 'Intégration des contrôles de sécurité', 3, 'dev', ['E.2'], 100),

    ('F', 'Environnements dev, préproduction, production', None, None, [], None),
    ('F.1', 'Environnement de développement et déploiement automatique', 2, 'devops', ['E.2'], 100),
    ('F.2', "Environnement de préproduction et anonymisation", 3, 'devops', ['F.1'], 100),
    ('F.3', 'Environnement de production et validation humaine', 3, 'devops', ['F.2'], 100),

    ('G', 'Métriques et alertes', None, None, [], None),
    ('G.1', 'Collecte des métriques système et conteneurs', 2, 'devops', ['F.3'], 100),
    ('G.2', 'Tableaux de bord et indicateurs de pilotage', 2, 'devops', ['G.1'], 100),
    ('G.3', "Règles d'alerte et canaux de notification", 1, 'devops', ['G.2'], 100),

    ('H', 'Sauvegardes et restauration', None, None, [], None),
    ('H.1', 'Sauvegardes automatisées et externalisation chiffrée', 3, 'devops', ['F.3'], 100),
    ('H.2', 'Procédures de restauration des trois environnements', 2, 'devops', ['H.1'], 100),
    ('H.3', 'Test de restauration réel, chronométré et consigné', 1, 'devops', ['H.2'], 100),

    ('I', 'Documentation et procédures', None, None, [], None),
    ('I.1', "Diagramme d'infrastructure et procédures BPMN", 2, 'devops', ['H.3'], 100),
    ('I.2', 'Fiches de mode opératoire par profil', 2, 'devops', ['I.1'], 60),
    ('I.3', 'Relecture et validation', 2, 'chef', ['I.2'], 0),

    ('J', 'Formation des équipes', None, None, [], None),
    ('J.1', 'Préparation des supports et des ateliers', 2, 'devops', ['I.3'], 0),
    ('J.2', 'Ateliers développeurs, sept sessions', 3, 'devops', ['J.1'], 0),
    ('J.3', 'Ateliers chefs de projet et présentation générale', 2, 'chef', ['J.1'], 0),
]

# (name, after which task, colour)
MILESTONES = [
    ('W1 Choix techniques validés', 'A.3'),
    ('W2 Socle en ligne', 'B.4'),
    ('W3 Code versionné', 'C.3'),
    ('W4 Première chaîne complète', 'D.4'),
    ('W5 Généricité prouvée', 'E.4'),
    ('W6 Trois environnements actifs', 'F.3'),
    ('W7 Reprise après sinistre validée', 'H.3'),
    ('W8 Équipes autonomes', 'J.3'),
]


def working_days_after(start: dt.date, days: int) -> dt.date:
    """Adds `days` working days, skipping Saturdays and Sundays."""
    current, left = start, days
    while left > 0:
        current += dt.timedelta(days=1)
        if current.weekday() < 5:
            left -= 1
    return current


def next_working_day(day: dt.date) -> dt.date:
    while day.weekday() >= 5:
        day += dt.timedelta(days=1)
    return day


def schedule() -> dict[str, tuple[dt.date, dt.date]]:
    """ASAP: a task starts the working day after the last of its predecessors ends."""
    dates: dict[str, tuple[dt.date, dt.date]] = {}
    for ref, _, duration, _, preds, _ in TASKS:
        if duration is None:
            continue
        if not preds:
            start = next_working_day(PROJECT_START)
        else:
            last_end = max(dates[p][1] for p in preds)
            start = next_working_day(last_end + dt.timedelta(days=1))
        end = working_days_after(start, duration - 1)
        dates[ref] = (start, end)
    return dates


def build() -> str:
    dates = schedule()

    total = sum(d * RATES[r] for _, _, d, r, _, _ in TASKS if d)
    days = sum(d for _, _, d, _, _, _ in TASKS if d)
    assert total == EXPECTED_TOTAL, f'{total} au lieu de {EXPECTED_TOTAL}'
    assert days == 74, days

    project = ET.Element('project', {
        'name': "Mise en place du workflow d'intégration continue",
        'company': 'Furious Ducks',
        'webLink': '',
        'view-date': PROJECT_START.isoformat(),
        'view-index': '0',
        'gantt-divider-location': '460',
        'resource-divider-location': '300',
        'version': '3.3.3316',
        'locale': 'fr_FR',
    })
    ET.SubElement(project, 'description').text = (
        "Projet interne. Du cadrage à la formation des équipes. "
        "Planification au plus tôt, voir la partie H du cahier des spécifications techniques."
    )

    view = ET.SubElement(project, 'view', {'zooming-state': 'default:3', 'id': 'gantt-chart'})
    for fid, name, width in [('tpd3', 'name', '220'), ('tpd4', 'begindate', '85'),
                             ('tpd5', 'enddate', '85'), ('tpd6', 'duration', '50'),
                             ('tpd7', 'completion', '50'), ('tpd8', 'coordinator', '90')]:
        ET.SubElement(view, 'field', {'id': fid, 'name': name, 'width': width,
                                      'order': str(len(view))})
    ET.SubElement(project, 'view', {'id': 'resource-table'})

    tasks_el = ET.SubElement(project, 'tasks', {
        'empty-milestones': 'true', 'color': '#8cb6ce'})
    ET.SubElement(tasks_el, 'taskproperties')

    ids: dict[str, int] = {}
    next_id = 0
    parents: dict[str, ET.Element] = {}

    for ref, name, duration, resource, preds, done in TASKS:
        if duration is None:                       # a lot, carrying its tasks
            el = ET.SubElement(tasks_el, 'task', {
                'id': str(next_id), 'uid': f'lot{ref}', 'name': f'{ref}. {name}',
                'meeting': 'false', 'start': PROJECT_START.isoformat(),
                'duration': '1', 'complete': '0', 'expand': 'true',
            })
            parents[ref] = el
            ids[ref] = next_id
            next_id += 1
            continue

        start, end = dates[ref]
        parent = parents[ref.split('.')[0]]
        el = ET.SubElement(parent, 'task', {
            'id': str(next_id), 'uid': ref, 'name': f'{ref} {name}',
            'meeting': 'false', 'start': start.isoformat(), 'duration': str(duration),
            'complete': str(done), 'expand': 'true',
        })
        ET.SubElement(el, 'notes').text = (
            f'Ressource : {resource}. Coût : {duration} j x {RATES[resource]:.0f} € '
            f'= {duration * RATES[resource]:.0f} €'
        )
        ids[ref] = next_id
        next_id += 1

    # Milestones, placed the day the task they confirm ends.
    for name, after in MILESTONES:
        _, end = dates[after]
        ET.SubElement(tasks_el, 'task', {
            'id': str(next_id), 'uid': f'ms{next_id}', 'name': name, 'meeting': 'true',
            'start': end.isoformat(), 'duration': '0', 'complete': '0', 'expand': 'true',
        })
        next_id += 1

    # Dependencies, added once every id is known.
    for ref, _, duration, _, preds, _ in TASKS:
        if duration is None:
            continue
        for pred in preds:
            holder = tasks_el.find(f".//task[@uid='{ref}']")
            ET.SubElement(holder, 'depend', {
                'id': str(ids[ref]), 'type': '2', 'difference': '0', 'hardness': 'Strong',
            })
            # GanttProject declares the link on the PREDECESSOR, pointing forward.
            holder.remove(holder[-1])
            source = tasks_el.find(f".//task[@uid='{pred}']")
            ET.SubElement(source, 'depend', {
                'id': str(ids[ref]), 'type': '2', 'difference': '0', 'hardness': 'Strong',
            })

    res_el = ET.SubElement(project, 'resources')
    for rid, name, key in RESOURCES:
        ET.SubElement(res_el, 'resource', {
            'id': str(rid), 'name': name, 'function': 'Default:1',
            'contacts': '', 'phone': '',
        })

    alloc = ET.SubElement(project, 'allocations')
    by_key = {key: rid for rid, _, key in RESOURCES}
    for ref, _, duration, resource, _, _ in TASKS:
        if duration is None:
            continue
        ET.SubElement(alloc, 'allocation', {
            'task-id': str(ids[ref]), 'resource-id': str(by_key[resource]),
            'function': 'Default:1', 'responsible': 'true', 'load': '100.0',
        })

    ET.SubElement(project, 'vacations')
    roles = ET.SubElement(project, 'roles', {'roleset-name': 'Default'})

    ET.indent(project, space='    ')
    return '<?xml version="1.0" encoding="UTF-8"?>\n' + ET.tostring(project, encoding='unicode')


def markdown_table() -> str:
    """The same tasks as a table for part H.3, so the two cannot disagree."""
    dates = schedule()
    label = {'devops': 'Ingénieur DevOps', 'dev': 'Développeur', 'chef': 'Chef de projet'}
    rows = ['| Réf. | Tâche | Durée | Début | Fin | Ressource | Prédécesseur | Avanc. |',
            '|---|---|---|---|---|---|---|---|']
    for ref, name, duration, resource, preds, done in TASKS:
        if duration is None:
            total = sum(d for r, _, d, _, _, _ in TASKS if d and r.startswith(ref + '.'))
            rows.append(f'| **{ref}** | **{name}** | **{total} j** | | | | | |')
            continue
        start, end = dates[ref]
        rows.append(
            f'| {ref} | {name} | {duration} j | {start:%d/%m} | {end:%d/%m} | '
            f'{label[resource]} | {", ".join(preds) or "—"} | {done} % |'
        )
    return '\n'.join(rows).replace('—', '')


if __name__ == '__main__':
    out = pathlib.Path(__file__).parent / 'workflow-furious-ducks.gan'
    out.write_text(build(), encoding='utf-8')

    table = pathlib.Path(__file__).parent / 'taches.md'
    table.write_text(markdown_table() + '\n', encoding='utf-8')

    dates = schedule()
    first = min(s for s, _ in dates.values())
    last = max(e for _, e in dates.values())
    total = sum(d * RATES[r] for _, _, d, r, _, _ in TASKS if d)
    print(f'  {out.name}')
    print(f'  {len([t for t in TASKS if t[2]])} tâches, {len(MILESTONES)} jalons')
    print(f'  du {first:%d/%m/%Y} au {last:%d/%m/%Y}')
    print(f'  74 jours-ressource, {total:,.0f} €'.replace(',', ' '))
