"""Builds ARCHIVE_Studio.html from src/. Scene files in src/scenes/ are loaded ahead of the engine
(in file-name order), so each chapter's data stays in its own file."""
import pathlib
src = pathlib.Path('src')
h = (src/'studio.html').read_text()
scenes = ''.join(f.read_text() + '\n' for f in sorted((src/'scenes').glob('*.js')))
worlds = ''.join(f.read_text() + '\n' for f in sorted((src/'worlds').glob('*.glsl')))
chars = ''.join(f.read_text() + '\n' for f in sorted((src/'characters').glob('*.glsl')))
parts = {'/*SHADER*/': (src/'shader.glsl').read_text().replace('/*CHARACTERS*/', chars, 1).replace('/*WORLDS*/', worlds, 1),
         '/*ENGINE*/': scenes + (src/'engine.js').read_text(),
         '/*AUDIO*/': (src/'audio.js').read_text(),
         '/*APP*/': (src/'app.js').read_text()}
for tag, text in parts.items():
    h = h.replace(tag, text, 1)
pathlib.Path('ARCHIVE_Studio.html').write_text(h)
print('built', len(h)//1024, 'KB')
