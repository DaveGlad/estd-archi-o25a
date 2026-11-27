#!/usr/bin/env python3
"""
Generates the seven diagrams of the technical specification, in two formats at once.

    python3 generate.py

For each diagram it writes:

  *.drawio   the editable source. Lucidchart imports it directly
             (Fichier > Importer > diagrams.net), and so does draw.io.
  *.svg      the same layout, rendered. `render-png.ts` turns these into the PNGs
             that go into the document.

Why generate rather than draw by hand.

The diagrams restate processes that are already written out, lane by lane, in
`../sections/G-procedures-bpmn.md`. Drawing them by hand would create a second copy
that drifts from the first the next time a stage moves in the pipeline. Here the
spec below IS the diagram, so the two cannot disagree without someone noticing.

On the shapes.

BPMN notation is respected in its grammar -- thin circle for a start event, thick
circle for an end event, diamond for an exclusive gateway, rounded rectangle for a
task, double border for a call to a sub-process -- but drawn with primitive shapes
rather than with draw.io's BPMN stencil set. That is deliberate: a stencil travels
as a name, and an importer that does not know the name draws an empty box. A
rectangle, an ellipse and a diamond survive every import. The legend on each sheet
states the convention, which is what a reader needs.
"""

from __future__ import annotations

import html
import pathlib
import xml.etree.ElementTree as ET

# --------------------------------------------------------------------------- layout

COL_W = 230          # horizontal pitch between two columns
ROW_H = 110          # vertical pitch between two rows inside a lane
LANE_PAD = 26        # breathing room at the top and bottom of a lane
LANE_TITLE_W = 34    # width of the vertical title bar of a pool
NODE_W = 170
NODE_H = 62
EVENT_D = 54         # diameter of a start or end event
GATE_D = 86          # diagonal of a gateway

PALETTE = {
    'task':    ('#eef4fb', '#2f5d8c'),
    'auto':    ('#eaf3ee', '#2f6d4f'),
    'human':   ('#fdf3e3', '#9a6a17'),
    'start':   ('#ffffff', '#2f6d4f'),
    'end':     ('#ffffff', '#2f5d8c'),
    'error':   ('#fdecea', '#a6342a'),
    'gateway': ('#fffbe9', '#9a6a17'),
    'call':    ('#f1eef8', '#59438f'),
}

SHAPES = {'start', 'end', 'error'}          # drawn as circles
DIAMONDS = {'gateway'}


class Node:
    def __init__(self, key, kind, label, lane, col, row=0):
        self.key, self.kind, self.label = key, kind, label
        self.lane, self.col, self.row = lane, col, row
        self.x = self.y = self.w = self.h = 0


class Diagram:
    def __init__(self, name, title, lanes, nodes, edges, note=''):
        self.name, self.title, self.note = name, title, note
        self.lanes = lanes                  # ordered list of lane names, [] for no pool
        self.nodes = {n.key: n for n in nodes}
        self.order = [n.key for n in nodes]
        self.edges = edges                  # (from, to, label)
        self._place()

    def _place(self):
        lane_rows = {}
        for n in self.nodes.values():
            lane_rows[n.lane] = max(lane_rows.get(n.lane, 0), n.row + 1)

        lane_y, y = {}, 0
        for lane in (self.lanes or ['']):
            lane_y[lane] = y
            y += lane_rows.get(lane, 1) * ROW_H + 2 * LANE_PAD
        self.height = y
        self.lane_h = {lane: lane_rows.get(lane, 1) * ROW_H + 2 * LANE_PAD
                       for lane in (self.lanes or [''])}

        max_col = max(n.col for n in self.nodes.values())
        grid_w = LANE_TITLE_W + (max_col + 1) * COL_W + 40

        # The canvas has to hold the title, the note and the legend, not only the boxes.
        # A narrow diagram like the activity one is two columns wide and its title is far
        # wider than that: sized on the grid alone, the heading ran off the right edge and
        # the last three entries of the legend were simply not on the image.
        title_w = len(self.title) * 9.2 + 32
        note_w = len(self.note) * 5.4 + 32
        legend_w = sum(30 + len(label) * 5.6 for _, label in LEGEND) + 32
        self.width = max(grid_w, title_w, note_w, min(legend_w, 1400))

        for n in self.nodes.values():
            if n.kind in SHAPES:
                n.w = n.h = EVENT_D
            elif n.kind in DIAMONDS:
                n.w = n.h = GATE_D
            else:
                n.w, n.h = NODE_W, NODE_H
            cx = LANE_TITLE_W + 20 + n.col * COL_W + NODE_W / 2
            cy = lane_y[n.lane] + LANE_PAD + n.row * ROW_H + NODE_H / 2
            n.x, n.y = cx - n.w / 2, cy - n.h / 2
        self.lane_y = lane_y


# --------------------------------------------------------------------------- drawio

def style_for(kind: str) -> str:
    fill, stroke = PALETTE[kind]
    base = f'fillColor={fill};strokeColor={stroke};fontColor=#1b2733;fontSize=11;html=1;whiteSpace=wrap;align=center;verticalAlign=middle;'
    if kind == 'start':
        return 'ellipse;' + base + 'strokeWidth=2;verticalLabelPosition=bottom;verticalAlign=top;'
    if kind in ('end', 'error'):
        return 'ellipse;' + base + 'strokeWidth=4;verticalLabelPosition=bottom;verticalAlign=top;'
    if kind == 'gateway':
        # Beside the diamond, not beneath it. See the note on label placement in `to_svg`:
        # underneath, the question printed on top of the answers leaving it.
        return ('rhombus;' + base + 'strokeWidth=2;labelPosition=right;align=left;'
                'verticalLabelPosition=middle;verticalAlign=middle;spacingLeft=6;')
    if kind == 'call':
        return 'rounded=1;arcSize=12;' + base + 'strokeWidth=4;'
    return 'rounded=1;arcSize=12;' + base + 'strokeWidth=2;'


def to_drawio(d: Diagram) -> str:
    mxfile = ET.Element('mxfile', host='app.diagrams.net')
    diagram = ET.SubElement(mxfile, 'diagram', name=d.title[:50])
    model = ET.SubElement(diagram, 'mxGraphModel', dx='1100', dy='760', grid='1',
                          gridSize='10', page='1', pageScale='1',
                          pageWidth='1169', pageHeight='826', math='0', shadow='0')
    root = ET.SubElement(model, 'root')
    ET.SubElement(root, 'mxCell', id='0')
    ET.SubElement(root, 'mxCell', id='1', parent='0')

    def geo(cell, x, y, w, h):
        g = ET.SubElement(cell, 'mxGeometry')
        g.set('x', str(round(x))); g.set('y', str(round(y)))
        g.set('width', str(round(w))); g.set('height', str(round(h)))
        g.set('as', 'geometry')

    for lane in d.lanes:
        c = ET.SubElement(root, 'mxCell', id=f'lane_{lane}',
                          value=lane,
                          style=('swimlane;horizontal=0;startSize=%d;html=1;fillColor=none;'
                                 'strokeColor=#8fa3b8;fontSize=12;fontStyle=1;fontColor=#1b2733;'
                                 'swimlaneFillColor=#ffffff;' % LANE_TITLE_W),
                          vertex='1', parent='1')
        geo(c, 0, d.lane_y[lane], d.width, d.lane_h[lane])

    for key in d.order:
        n = d.nodes[key]
        c = ET.SubElement(root, 'mxCell', id=f'n_{key}', value=n.label,
                          style=style_for(n.kind), vertex='1', parent='1')
        geo(c, n.x, n.y, n.w, n.h)

    for i, (a, b, label) in enumerate(d.edges):
        c = ET.SubElement(root, 'mxCell', id=f'e_{i}', value=label or '',
                          style=('edgeStyle=orthogonalEdgeStyle;rounded=1;html=1;'
                                 'strokeColor=#5a6b7d;fontSize=10;fontColor=#43525f;'
                                 'labelBackgroundColor=#ffffff;endArrow=block;endFill=1;'),
                          edge='1', parent='1', source=f'n_{a}', target=f'n_{b}')
        g = ET.SubElement(c, 'mxGeometry')
        g.set('relative', '1'); g.set('as', 'geometry')

    ET.indent(mxfile, space='  ')
    return ET.tostring(mxfile, encoding='unicode')


# --------------------------------------------------------------------------- svg

LEGEND = [
    ('start', 'Événement de début'),
    ('task', 'Tâche'),
    ('auto', 'Tâche automatique'),
    ('human', 'Tâche humaine'),
    ('gateway', 'Passerelle exclusive'),
    ('call', 'Appel de sous-processus'),
    ('end', 'Événement de fin'),
    ('error', 'Fin sur erreur'),
]


def overlaps(a, b) -> bool:
    """Two boxes (x0, y0, x1, y1) share some surface."""
    return not (a[2] <= b[0] or b[2] <= a[0] or a[3] <= b[1] or b[3] <= a[1])


def wrap(label: str, width: int):
    """Breaks a label on its explicit newlines first, then on width."""
    out = []
    for part in label.split('\n'):
        line = ''
        for word in part.split():
            trial = (line + ' ' + word).strip()
            if len(trial) > width and line:
                out.append(line); line = word
            else:
                line = trial
        out.append(line)
    return [l for l in out if l]


def to_svg(d: Diagram) -> str:
    top, legend_h = 72, 46
    H = top + d.height + legend_h + 24
    W = d.width + 24
    s = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" '
         f'viewBox="0 0 {W} {H}" font-family="Helvetica, Arial, sans-serif">',
         f'<rect width="{W}" height="{H}" fill="#ffffff"/>',
         f'<text x="16" y="30" font-size="17" font-weight="600" fill="#1b2733">'
         f'{html.escape(d.title)}</text>']
    if d.note:
        s.append(f'<text x="16" y="52" font-size="11" fill="#5a6b7d">{html.escape(d.note)}</text>')

    for lane in d.lanes:
        y = top + d.lane_y[lane]
        h = d.lane_h[lane]
        s.append(f'<rect x="8" y="{y}" width="{d.width}" height="{h}" fill="none" stroke="#8fa3b8"/>')
        s.append(f'<rect x="8" y="{y}" width="{LANE_TITLE_W}" height="{h}" fill="#f2f5f8" stroke="#8fa3b8"/>')
        cx, cy = 8 + LANE_TITLE_W / 2, y + h / 2
        s.append(f'<text x="{cx}" y="{cy}" font-size="12" font-weight="600" fill="#1b2733" '
                 f'text-anchor="middle" transform="rotate(-90 {cx} {cy})">{html.escape(lane)}</text>')

    # Edges first, so the boxes sit on top of the lines. Their labels come last of all,
    # in a third pass: drawn here they would be covered by the very boxes the line runs
    # between, and a 60 px gap is narrower than "webhook HTTP".
    #
    # Three routes, chosen on the relative position of the two shapes.
    #
    # A straight horizontal line is only correct between NEIGHBOURING columns. Over a
    # longer span it passes clean through whatever sits in between, and the reader sees
    # an arrow that was never declared -- the first version had Prometheus reaching the
    # container exporter look like the system exporter calling it.
    #
    # Everything else goes around, under the source row: every "Non" branch, every row
    # wrap, every jump between lanes.
    # A gateway with three branches sent all three around at the same height, so the
    # three labels printed on top of one another and read as one unusable word. Each
    # branch after the first is pushed down a little, and its label slid along.
    # Everything a flow label has to stay clear of: the shapes themselves, and the labels
    # the shapes carry outside their own outline. Computed before any flow is drawn,
    # because a flow label is placed against what is already on the sheet.
    occupied: list[tuple[float, float, float, float]] = []
    for n in d.nodes.values():
        occupied.append((n.x, n.y + top, n.x + n.w, n.y + n.h + top))
        if n.kind in DIAMONDS:
            lines = wrap(n.label, 18)
            w = max(len(l) for l in lines) * 5.4
            cy = n.y + top + n.h / 2
            occupied.append((n.x + n.w + 6, cy - len(lines) * 6.5 - 2,
                             n.x + n.w + 10 + w, cy + len(lines) * 6.5 + 2))
        elif n.kind in SHAPES:
            lines = wrap(n.label, 22)
            w = max(len(l) for l in lines) * 5.4
            top_y = n.y + n.h + top + 8
            occupied.append((n.x + n.w / 2 - w / 2, top_y,
                             n.x + n.w / 2 + w / 2, top_y + len(lines) * 13 + 4))

    labels = []
    seen_from: dict[str, int] = {}
    for a, b, label in d.edges:
        rank = seen_from.get(a, 0)
        seen_from[a] = rank + 1
        na, nb = d.nodes[a], d.nodes[b]
        cx1, cy1 = na.x + na.w / 2, na.y + na.h / 2 + top
        cx2, cy2 = nb.x + nb.w / 2, nb.y + nb.h / 2 + top
        adjacent = abs(nb.col - na.col) <= 1

        if cy2 < cy1 - 4:
            # Backward: the target sits ABOVE the source. Every "Non" that sends the work
            # back to an earlier step is one of these.
            #
            # The generic route below cannot draw it. It leaves the bottom of the source,
            # runs to the target's column and comes back up, and on a vertical spine the
            # two columns are the same one: the line is drawn on top of itself and is
            # simply not visible. The flow looked like it had no loop at all, and the two
            # branch labels printed on the same spot under the gateway.
            #
            # So it goes out to the left, up, and back in. The rank keeps two loops that
            # leave the same shape on separate tracks.
            # Clamped so a loop leaving a first-column shape does not run off the sheet,
            # nor across the vertical title bar of its pool.
            floor = (LANE_TITLE_W + 6) if d.lanes else 10
            out = max(floor, na.x - 30 - rank * 18)
            # Enter the target on the side the loop arrives from, or the arrow crosses the
            # whole box to plant its head on the far edge.
            entry = nb.x + nb.w if out > nb.x + nb.w else nb.x
            path = (f'M {na.x} {cy1} L {out} {cy1} L {out} {cy2} L {entry} {cy2}')
            # Beside the shape it LEAVES, not halfway up the loop. The reader asks which
            # way a branch goes while looking at the gateway, and three loops labelled
            # "Non" halfway along their run read as three identical labels in a column
            # with nothing to attach them to.
            mx, my = out + 16, cy1 - 7
            s.append(f'<path d="{path}" fill="none" stroke="#5a6b7d" stroke-width="1.4" '
                     f'marker-end="url(#a)"/>')
            if label:
                labels.append((mx, my, label))
            continue

        if abs(cy1 - cy2) < 4 and cx2 > cx1 and adjacent:          # same row, next column
            path = f'M {na.x + na.w} {cy1} L {nb.x} {cy2}'
            mx, my = (na.x + na.w + nb.x) / 2, cy1 - 8
        elif abs(cx1 - cx2) < 4 and cy2 > cy1:                     # same column, down
            path = f'M {cx1} {na.y + na.h + top} L {cx2} {nb.y + top}'
            mx, my = cx1 + 8, (na.y + na.h + nb.y) / 2 + top
        else:                                                       # around, under the row
            detour = max(na.y + na.h, nb.y + nb.h) + top + 30
            if cy2 > cy1 + ROW_H / 2:
                detour = na.y + na.h + top + 26
            detour += rank * 13
            path = (f'M {cx1} {na.y + na.h + top} L {cx1} {detour} '
                    f'L {cx2} {detour} L {cx2} {nb.y + top}')
            # A third of the way along rather than the middle: the middle of a long
            # detour tends to land exactly under the label of the gateway it came from.
            # The rank slides each further branch along, so two labels never coincide.
            mx = cx1 + (cx2 - cx1) * (0.30 + 0.16 * rank)
            my = detour - 6

        s.append(f'<path d="{path}" fill="none" stroke="#5a6b7d" stroke-width="1.4" '
                 f'marker-end="url(#a)"/>')
        if label:
            labels.append((mx, my, label))

    for key in d.order:
        n = d.nodes[key]
        fill, stroke = PALETTE[n.kind]
        y = n.y + top
        sw = 3.5 if n.kind in ('end', 'error', 'call') else 1.8
        if n.kind in SHAPES:
            s.append(f'<circle cx="{n.x + n.w/2}" cy="{y + n.h/2}" r="{n.w/2}" fill="{fill}" '
                     f'stroke="{stroke}" stroke-width="{sw}"/>')
        elif n.kind in DIAMONDS:
            cx, cy, r = n.x + n.w / 2, y + n.h / 2, n.w / 2
            s.append(f'<polygon points="{cx},{cy-r} {cx+r},{cy} {cx},{cy+r} {cx-r},{cy}" '
                     f'fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/>')
            s.append(f'<path d="M {cx-13} {cy-13} L {cx+13} {cy+13} M {cx+13} {cy-13} '
                     f'L {cx-13} {cy+13}" stroke="{stroke}" stroke-width="2" fill="none"/>')
        else:
            s.append(f'<rect x="{n.x}" y="{y}" width="{n.w}" height="{n.h}" rx="8" fill="{fill}" '
                     f'stroke="{stroke}" stroke-width="{sw}"/>')

        # Where the label goes depends on the shape.
        #
        # Inside, for a task. Underneath, for a start or end event, which is what BPMN
        # does and where there is room.
        #
        # To the RIGHT for a gateway, and that is the fix for a whole class of collision.
        # A diamond is 86 px tall in a row of 110, so only 24 px separate it from the next
        # shape: a label underneath lands on the branch label of the arrow leaving it, and
        # "Revue de code approuvée ?" printed on top of "Oui" and "Non" at once. The gap
        # beside the diamond is about 100 px, which is room enough.
        inside = n.kind not in SHAPES and n.kind not in DIAMONDS
        if n.kind in DIAMONDS:
            lines = wrap(n.label, 18)
            base = y + n.h / 2 - (len(lines) - 1) * 6.5 + 4
            for i, line in enumerate(lines):
                # A thick halo, because the branch leaving the gateway runs through this
                # exact band on its way to the next shape. At 3.5 the line reappeared in
                # the gaps between words, as a dot nobody could explain.
                s.append(f'<text x="{n.x + n.w + 8}" y="{base + i*13}" font-size="10.5" '
                         f'fill="#1b2733" text-anchor="start" paint-order="stroke" '
                         f'stroke="#ffffff" stroke-width="5.5">{html.escape(line)}</text>')
            continue

        lines = wrap(n.label, 26 if inside else 22)
        base = y + n.h / 2 - (len(lines) - 1) * 6.5 if inside else y + n.h + 18
        # A task carries its label inside its own outline, where nothing crosses. The label
        # of an event hangs underneath, in open space a flow may well run through, so it
        # gets the same halo as a gateway's.
        halo = '' if inside else (' paint-order="stroke" stroke="#ffffff" stroke-width="5.5"')
        for i, line in enumerate(lines):
            s.append(f'<text x="{n.x + n.w/2}" y="{base + i*13 + (4 if inside else 0)}" '
                     f'font-size="10.5" fill="#1b2733" text-anchor="middle"{halo}>'
                     f'{html.escape(line)}</text>')

    # Third pass: the flow labels, above everything, each on its own white halo.
    #
    # Placed one at a time against everything already on the sheet, and nudged until the
    # spot is free. Without this the two branches of a gateway land on the same point and
    # print "Oui" and "Non" on top of each other, which is worse than either alone: the
    # reader cannot tell which way the flow goes.
    #
    # The nudges alternate above and below the ideal position, so a label stays near the
    # line it belongs to instead of drifting off in one direction.
    for mx, my, label in labels:
        w = len(label) * 5.4 + 6
        x, y_ = mx, my
        for step in range(14):
            offset = ((step + 1) // 2) * 12 * (1 if step % 2 else -1)
            box = (x - w / 2, y_ + offset - 9, x + w / 2, y_ + offset + 3)
            if not any(overlaps(box, taken) for taken in occupied):
                y_ += offset
                break
        occupied.append((x - w / 2, y_ - 9, x + w / 2, y_ + 3))
        s.append(f'<text x="{x}" y="{y_}" font-size="10" fill="#43525f" '
                 f'text-anchor="middle" paint-order="stroke" stroke="#ffffff" '
                 f'stroke-width="3.5">{html.escape(label)}</text>')

    ly = top + d.height + 26
    x = 16
    for kind, label in LEGEND:
        fill, stroke = PALETTE[kind]
        if kind in SHAPES:
            s.append(f'<circle cx="{x+8}" cy="{ly}" r="8" fill="{fill}" stroke="{stroke}" '
                     f'stroke-width="{3 if kind != "start" else 1.8}"/>')
        elif kind in DIAMONDS:
            s.append(f'<polygon points="{x+8},{ly-8} {x+16},{ly} {x+8},{ly+8} {x},{ly}" '
                     f'fill="{fill}" stroke="{stroke}" stroke-width="1.8"/>')
        else:
            s.append(f'<rect x="{x}" y="{ly-7}" width="18" height="14" rx="3" fill="{fill}" '
                     f'stroke="{stroke}" stroke-width="{3.5 if kind == "call" else 1.8}"/>')
        s.append(f'<text x="{x+24}" y="{ly+4}" font-size="10" fill="#43525f">{html.escape(label)}</text>')
        x += 30 + len(label) * 5.6

    s.append('<defs><marker id="a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" '
             'markerHeight="7" orient="auto-start-reverse">'
             '<path d="M 0 0 L 10 5 L 0 10 z" fill="#5a6b7d"/></marker></defs>')
    s.append('</svg>')
    return '\n'.join(s)


# --------------------------------------------------------------------------- main

def write(diagrams):
    here = pathlib.Path(__file__).parent
    for d in diagrams:
        (here / f'{d.name}.drawio').write_text(to_drawio(d), encoding='utf-8')
        (here / f'{d.name}.svg').write_text(to_svg(d), encoding='utf-8')
        print(f'  {d.name:<28} {len(d.nodes):>2} objets, {len(d.edges):>2} flux, '
              f'{len(d.lanes) or 1} couloir(s)')


if __name__ == '__main__':
    from specs import DIAGRAMS
    print('Diagrammes du cahier des spécifications techniques')
    write(DIAGRAMS)
