#!/usr/bin/env python3
"""
Assembles the technical specification into one file, and converts it.

    python3 assembler.py

Produces, next to this script:

  cahier-specifications-techniques.md    the whole dossier as one markdown file
  ESTD ARCHI 15M – G3 – Cahier des spécifications techniques.docx

The .docx is the deliverable. Google Docs and Word both open it with the headings,
the tables and the seven figures in place, which is what matters: a dossier pasted
as plain text loses its table of contents, and a table of contents typed by hand
stops matching the document on the first edit.

Why a script rather than a copy-paste.

The nine parts are written in nine files, so that four people can work on them at
once. Assembling by hand means remembering the order, the annexes, the shared TJM
file that lives in the OTHER dossier, and the image paths. It means getting it
wrong once, late, on the evening of the deadline.

The brief imposes A4 portrait and pagination in the form 1/100. Pandoc sets
neither, so `finalise_docx` below writes both into the file afterwards.

One step is left to the word processor on purpose: the table of contents. The
brief wants it with page numbers, and only the software that lays out the pages
knows where they break. Inserting it is one menu entry, and it stays live.
"""

from __future__ import annotations

import pathlib
import re
import subprocess
import sys

HERE = pathlib.Path(__file__).parent
SECTIONS = HERE / 'sections'
ANNEXES = HERE / 'annexes'
SHARED_TJM = HERE.parent / '02-cahier-des-charges' / 'annexes' / 'calcul-tjm.md'

ORDER = [
    SECTIONS / '00-couverture.md',
    SECTIONS / '00-sommaire.md',
    SECTIONS / 'A-etat-des-lieux.md',
    SECTIONS / 'B-methodologie.md',
    SECTIONS / 'C-devops-devsecops.md',
    SECTIONS / 'D-workflow-cicd.md',
    SECTIONS / 'E-diagramme-infrastructure.md',
    SECTIONS / 'F-ressources-humaines.md',
    SECTIONS / 'G-procedures-bpmn.md',
    SECTIONS / 'H-gantt.md',
    SECTIONS / 'I-couts-rentabilite.md',
]

ANNEX_ORDER = [
    ('Annexe 1 : calcul du taux journalier moyen', SHARED_TJM),
    ('Annexe 2 : base de calcul des coûts d\'hébergement', ANNEXES / 'annexe-2-hebergement.md'),
    ('Annexe 3 : base de calcul des pertes de la situation actuelle',
     ANNEXES / 'annexe-3-pertes-actuelles.md'),
]

OUT_MD = HERE / 'cahier-specifications-techniques.md'
OUT_DOCX = HERE / 'ESTD ARCHI 15M – G3 – Cahier des spécifications techniques.docx'


def clean(text: str, source: pathlib.Path) -> str:
    """Drops what belongs to the repository rather than to the dossier."""
    # Image paths are relative to the section; make them relative to this folder,
    # which is the directory pandoc resolves them from.
    text = text.replace('](../diagrammes/', '](diagrammes/')

    # A block quote addressed to the team, not to the jury. Recognised by the
    # phrases the team uses between themselves.
    lines, out, skipping = text.splitlines(), [], False
    internal = ('à confirmer avant l', 'Note de production', 'Responsable :',
                'Échéance :', 'à compléter')
    for line in lines:
        if line.startswith('>') and any(m in line for m in internal):
            skipping = True
            continue
        if skipping and (line.startswith('>') or not line.strip()):
            if not line.strip():
                skipping = False
            continue
        skipping = False
        out.append(line)
    return '\n'.join(out)


def build_markdown() -> str:
    parts: list[str] = []
    for path in ORDER:
        if not path.exists():
            sys.exit(f'manquant : {path}')
        parts.append(clean(path.read_text(encoding='utf-8').rstrip(), path))

    parts.append('# Annexes')
    for title, path in ANNEX_ORDER:
        if not path.exists():
            sys.exit(f'manquant : {path}')
        body = clean(path.read_text(encoding='utf-8').rstrip(), path)
        # Each annex arrives with its own level-1 heading; replace it with the
        # numbered one, so the whole dossier has a single heading hierarchy.
        body = re.sub(r'\A#\s+.*', f'## {title}', body, count=1)
        parts.append(body)

    return '\n\n\\newpage\n\n'.join(parts) + '\n'


def finalise_docx(path: pathlib.Path) -> None:
    """Imposes A4 portrait and the pagination the brief asks for.

    Two requirements of the plan, both written in bold in the source document:
    « le format du cahier est obligatoirement en portrait au format A4 » and
    « doit comporter une pagination (1/100) et non un numéro de page (1) ».

    Neither comes for free. Pandoc's default template carries no page size at all,
    so the word processor applies whatever its locale says, which is US Letter on
    an American account. And a page number on its own is what every template does
    by default; the brief explicitly refuses it.

    The footer uses two Word fields rather than literal text, so the numbering
    survives every edit: PAGE renumbers itself, NUMPAGES recounts the document.
    """
    import docx
    from docx.enum.section import WD_ORIENT
    from docx.enum.text import WD_ALIGN_PARAGRAPH
    from docx.oxml.ns import qn
    from docx.shared import Mm, Pt

    def field(run, instruction: str) -> None:
        begin = run._r.makeelement(qn('w:fldChar'), {qn('w:fldCharType'): 'begin'})
        instr = run._r.makeelement(qn('w:instrText'), {qn('xml:space'): 'preserve'})
        instr.text = instruction
        end = run._r.makeelement(qn('w:fldChar'), {qn('w:fldCharType'): 'end'})
        run._r.append(begin)
        run._r.append(instr)
        run._r.append(end)

    document = docx.Document(str(path))
    for section in document.sections:
        section.orientation = WD_ORIENT.PORTRAIT
        section.page_width = Mm(210)
        section.page_height = Mm(297)
        section.left_margin = section.right_margin = Mm(20)
        section.top_margin = section.bottom_margin = Mm(18)

        footer = section.footer
        footer.is_linked_to_previous = False
        para = footer.paragraphs[0] if footer.paragraphs else footer.add_paragraph()
        para.text = ''
        para.alignment = WD_ALIGN_PARAGRAPH.CENTER

        run = para.add_run()
        run.font.size = Pt(9)
        field(run, ' PAGE ')
        para.add_run(' / ').font.size = Pt(9)
        run = para.add_run()
        run.font.size = Pt(9)
        field(run, ' NUMPAGES ')

    document.save(str(path))


def main() -> None:
    markdown = build_markdown()
    OUT_MD.write_text(markdown, encoding='utf-8')

    words = len(markdown.split())
    figures = markdown.count('![')
    tables = markdown.count('\n|---')
    print(f'  {OUT_MD.name}')
    print(f'  {words:,} mots, {figures} figures, {tables} tableaux'.replace(',', ' '))

    cmd = [
        'pandoc', str(OUT_MD),
        '-o', str(OUT_DOCX),
        '--from', 'markdown+pipe_tables+yaml_metadata_block',
        '--resource-path', str(HERE),
        '--metadata', 'lang=fr-FR',
    ]
    # No `--toc`, and no `title` metadata.
    #
    # Both looked like free wins and both made the document worse. The title
    # metadata prints a title page of its own, which duplicated the cover that is
    # already the first section. And `--toc` inserts a Word field headed "Table of
    # Contents", in English whatever the document language, that Google Docs does
    # not compute on import: it arrived as an empty heading above the real
    # sommaire. The table of contents is inserted in the word processor instead,
    # where it is live, clickable and carries the page numbers the brief asks for.
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(result.stderr, file=sys.stderr)
        sys.exit('pandoc a échoué')

    finalise_docx(OUT_DOCX)

    size = OUT_DOCX.stat().st_size / 1024
    print(f'  {OUT_DOCX.name}')
    print(f'  {size:,.0f} Ko, A4 portrait, pagination 1/100'.replace(',', ' '))
    if result.stderr.strip():
        print('  avertissements pandoc :')
        for line in result.stderr.strip().splitlines()[:6]:
            print(f'    {line}')


if __name__ == '__main__':
    main()
