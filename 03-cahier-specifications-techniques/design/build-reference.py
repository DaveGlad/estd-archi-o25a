#!/usr/bin/env python3
"""
Builds the typographic model that pandoc applies to the dossier.

    python3 build-reference.py

Writes `reference.docx`, which `../assembler.py` passes to pandoc through
`--reference-doc`. Pandoc copies its styles, its page setup and its header and
footer into the generated document, so the whole dossier is laid out from one
file rather than retouched by hand after every export.

Why start from pandoc's own file.

`pandoc --print-default-data-file reference.docx` prints the template pandoc
uses when none is given. It already declares every style pandoc will reach for,
including the ones that only appear in a corner case: `Image Caption`,
`Definition Term`, `Verbatim Char`. Writing a .docx from scratch means
discovering the missing one on the day a block quote lands in the middle of
part G. So the default is taken as the base, and only its appearance changes.

The design.

Colours are those of the seven figures, declared in `../diagrammes/generate.py`.
That is the whole point: a dossier whose text and whose diagrams share a palette
reads as one document, where two palettes read as a figure pasted in from
somewhere else.

Type is one family, Inter, told apart by size, weight and colour rather than by
a second typeface. That is the contemporary documentation setting, and it is
chosen here for a reason beyond fashion: the labels inside the seven figures are
set in a grotesque, so a grotesque text face puts the prose and the diagrams in
one family instead of making the figures look imported.

The line spacing goes to 1,3 rather than the 1,22 a serif would take. A sans set
tightly over a long measure is exactly where a reader loses the line.
"""

from __future__ import annotations

import pathlib
import subprocess
import sys

from docx import Document
from docx.enum.section import WD_SECTION_START
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_LINE_SPACING
from docx.oxml.ns import qn
from docx.shared import Mm, Pt, RGBColor

HERE = pathlib.Path(__file__).parent
OUT = HERE / 'reference.docx'

# From ../diagrammes/generate.py. Changing one without the other is how a dossier
# ends up with two blues.
INK = RGBColor(0x1B, 0x27, 0x33)        # body text
HEADING = RGBColor(0x2F, 0x5D, 0x8C)    # headings and rules
MUTED = RGBColor(0x5A, 0x6B, 0x7D)      # captions, secondary text
RULE = '8FA3B8'                          # hairlines
TABLE_HEAD = 'EEF4FB'                    # table header fill
CODE_BG = 'F2F5F8'

BODY_FONT = 'Inter'
HEAD_FONT = 'Inter'
MONO_FONT = 'Roboto Mono'


def set_font(style, name: str, size: float, *, colour=None, bold=False,
             italic=False, spacing_before=0, spacing_after=0, line=None,
             keep_with_next=False, align=None) -> None:
    font = style.font
    font.name = name
    font.size = Pt(size)
    font.bold = bold
    font.italic = italic
    if colour is not None:
        font.color.rgb = colour

    # python-docx sets only the Latin face. Without the three siblings, Word falls
    # back to its own default for anything it classifies as complex-script or East
    # Asian, which in practice hits the typographic quotes and the non-breaking
    # spaces French punctuation is full of.
    rpr = style.element.get_or_add_rPr()
    rfonts = rpr.get_or_add_rFonts()
    for attr in ('w:ascii', 'w:hAnsi', 'w:eastAsia', 'w:cs'):
        rfonts.set(qn(attr), name)

    # `Verbatim Char` is a character style: it styles a run inside a paragraph and
    # has no paragraph properties of its own. Everything below is skipped for it.
    fmt = getattr(style, 'paragraph_format', None)
    if fmt is None:
        return
    fmt.space_before = Pt(spacing_before)
    fmt.space_after = Pt(spacing_after)
    if line is not None:
        fmt.line_spacing = line
        fmt.line_spacing_rule = WD_LINE_SPACING.MULTIPLE
    fmt.keep_with_next = keep_with_next
    if align is not None:
        fmt.alignment = align
    # A heading alone at the foot of a page, or one line of a paragraph stranded
    # on the next, is the first thing that makes a document look unfinished.
    fmt.widow_control = True


def shade(element, fill: str) -> None:
    pr = element.get_or_add_pPr() if element.tag.endswith('}p') else element
    shd = pr.makeelement(qn('w:shd'), {
        qn('w:val'): 'clear', qn('w:color'): 'auto', qn('w:fill'): fill})
    pr.append(shd)


def bottom_rule(target, colour: str, size: int = 6) -> None:
    """A hairline under a heading style, or under one paragraph. `size` is in
    eighths of a point, which is how Word counts border weights."""
    # `or` would truth-test an lxml element, which lxml warns about and which
    # will stop meaning "has children" in a future version.
    element = target.element if hasattr(target, 'element') else target._p
    ppr = element.get_or_add_pPr()
    borders = ppr.makeelement(qn('w:pBdr'), {})
    bottom = borders.makeelement(qn('w:bottom'), {
        qn('w:val'): 'single', qn('w:sz'): str(size),
        qn('w:space'): '6', qn('w:color'): colour})
    borders.append(bottom)
    ppr.append(borders)


def build() -> None:
    base = HERE / '_pandoc-default.docx'
    with base.open('wb') as handle:
        result = subprocess.run(
            ['pandoc', '--print-default-data-file', 'reference.docx'],
            stdout=handle, stderr=subprocess.PIPE)
    if result.returncode != 0:
        sys.exit(result.stderr.decode())

    doc = Document(str(base))
    styles = doc.styles

    # ---------------------------------------------------------------- page
    for section in doc.sections:
        section.start_type = WD_SECTION_START.NEW_PAGE
        section.page_width, section.page_height = Mm(210), Mm(297)
        section.left_margin = section.right_margin = Mm(22)
        section.top_margin = Mm(20)
        section.bottom_margin = Mm(18)
        section.footer_distance = Mm(10)
        section.header_distance = Mm(12)

    # ---------------------------------------------------------------- body
    set_font(styles['Normal'], BODY_FONT, 10.5, colour=INK,
             spacing_after=8, line=1.3, align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    for name in ('Body Text', 'First Paragraph', 'Compact'):
        if name in [s.name for s in styles]:
            set_font(styles[name], BODY_FONT, 10.5, colour=INK,
                     spacing_after=8, line=1.3, align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    # ------------------------------------------------------------ headings
    #
    # A scale rather than arbitrary sizes: 20, 15, 12.5, 11, each about 1.22 times
    # the next, which is the same ratio as the line spacing. Nothing in the document
    # is sized by eye.
    set_font(styles['Heading 1'], HEAD_FONT, 21, colour=HEADING, bold=True,
             spacing_before=0, spacing_after=14, keep_with_next=True,
             align=WD_ALIGN_PARAGRAPH.LEFT)
    bottom_rule(styles['Heading 1'], RULE, size=8)

    set_font(styles['Heading 2'], HEAD_FONT, 15.5, colour=HEADING, bold=True,
             spacing_before=20, spacing_after=7, keep_with_next=True,
             align=WD_ALIGN_PARAGRAPH.LEFT)

    set_font(styles['Heading 3'], HEAD_FONT, 12.5, colour=INK, bold=True,
             spacing_before=15, spacing_after=5, keep_with_next=True,
             align=WD_ALIGN_PARAGRAPH.LEFT)

    set_font(styles['Heading 4'], HEAD_FONT, 11, colour=MUTED, bold=True,
             spacing_before=12, spacing_after=4, keep_with_next=True,
             align=WD_ALIGN_PARAGRAPH.LEFT)

    for name in ('Title', 'Subtitle'):
        if name in [s.name for s in styles]:
            set_font(styles[name], HEAD_FONT, 26 if name == 'Title' else 14,
                     colour=HEADING, bold=(name == 'Title'),
                     spacing_after=10, align=WD_ALIGN_PARAGRAPH.LEFT)

    # ------------------------------------------------------------- figures
    for name in ('Image Caption', 'Table Caption', 'Caption'):
        if name in [s.name for s in styles]:
            set_font(styles[name], HEAD_FONT, 9, colour=MUTED, italic=True,
                     spacing_before=4, spacing_after=14,
                     align=WD_ALIGN_PARAGRAPH.CENTER)

    # A figure is centred on the measure, not flushed left with the text.
    if 'Figure' in [s.name for s in styles]:
        styles['Figure'].paragraph_format.alignment = WD_ALIGN_PARAGRAPH.CENTER
        styles['Figure'].paragraph_format.space_before = Pt(10)
        styles['Figure'].paragraph_format.space_after = Pt(0)

    # ---------------------------------------------------------------- code
    for name in ('Source Code', 'Verbatim Char'):
        if name in [s.name for s in styles]:
            style = styles[name]
            set_font(style, MONO_FONT, 9, colour=INK)
            if name == 'Source Code':
                style.paragraph_format.space_before = Pt(6)
                style.paragraph_format.space_after = Pt(10)
                style.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.LEFT
                shade(style.element, CODE_BG)

    # ---------------------------------------------------------- block quote
    if 'Block Text' in [s.name for s in styles]:
        style = styles['Block Text']
        set_font(style, BODY_FONT, 10, colour=MUTED, italic=False,
                 spacing_before=8, spacing_after=10, line=1.2,
                 align=WD_ALIGN_PARAGRAPH.LEFT)
        ppr = style.element.get_or_add_pPr()
        borders = ppr.makeelement(qn('w:pBdr'), {})
        left = borders.makeelement(qn('w:left'), {
            qn('w:val'): 'single', qn('w:sz'): '18',
            qn('w:space'): '10', qn('w:color'): RULE})
        borders.append(left)
        ppr.append(borders)
        style.paragraph_format.left_indent = Mm(4)

    # --------------------------------------------------------------- table
    if 'Table' in [s.name for s in styles]:
        style = styles['Table']
        set_font(style, HEAD_FONT, 9.5, colour=INK, spacing_before=2,
                 spacing_after=2, line=1.1, align=WD_ALIGN_PARAGRAPH.LEFT)
        tbl_pr = style.element.find(qn('w:tblPr'))
        if tbl_pr is None:
            tbl_pr = style.element.makeelement(qn('w:tblPr'), {})
            style.element.append(tbl_pr)
        borders = tbl_pr.makeelement(qn('w:tblBorders'), {})
        for edge in ('top', 'left', 'bottom', 'right', 'insideH', 'insideV'):
            borders.append(borders.makeelement(qn(f'w:{edge}'), {
                qn('w:val'): 'single', qn('w:sz'): '4',
                qn('w:space'): '0', qn('w:color'): 'D4DCE4'}))
        tbl_pr.append(borders)
        margins = tbl_pr.makeelement(qn('w:tblCellMar'), {})
        for side, width in (('top', 60), ('left', 90), ('bottom', 60), ('right', 90)):
            margins.append(margins.makeelement(qn(f'w:{side}'), {
                qn('w:w'): str(width), qn('w:type'): 'dxa'}))
        tbl_pr.append(margins)

        # The header row: filled, bold, and repeated at the top of every page a
        # long table spills onto. Seventy-six tables, several of which break.
        band = style.element.makeelement(qn('w:tblStylePr'), {qn('w:type'): 'firstRow'})
        rpr = band.makeelement(qn('w:rPr'), {})
        b = rpr.makeelement(qn('w:b'), {})
        rpr.append(b)
        band.append(rpr)
        tcpr = band.makeelement(qn('w:tcPr'), {})
        tcpr.append(tcpr.makeelement(qn('w:shd'), {
            qn('w:val'): 'clear', qn('w:color'): 'auto', qn('w:fill'): TABLE_HEAD}))
        band.append(tcpr)
        style.element.append(band)

    # -------------------------------------------------------- header, footer
    section = doc.sections[0]
    section.different_first_page_header_footer = True

    header = section.header
    header.is_linked_to_previous = False
    para = header.paragraphs[0] if header.paragraphs else header.add_paragraph()
    para.text = 'Cahier des spécifications techniques · Furious Ducks'
    para.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    for run in para.runs:
        run.font.name = HEAD_FONT
        run.font.size = Pt(8)
        run.font.color.rgb = MUTED
    bottom_rule(para, 'D4DCE4', size=4)

    doc.save(str(OUT))
    base.unlink()

    print(f'  {OUT.name}')
    print(f'  corps {BODY_FONT} 10,5 pt · titres {HEAD_FONT} · code {MONO_FONT}')
    print(f'  A4 portrait, marges 22 et 20 mm, en-tête et pied de page')


if __name__ == '__main__':
    build()
