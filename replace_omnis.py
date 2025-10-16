import pathlib
from pathlib import Path

IGNORED_DIRS = {'.git', 'node_modules', 'dist', 'build', '.builder', '.next', '.turbo', '.cache'}
SUFFIXES = {'.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.css', '.scss', '.html', '.txt'}
ROOTS = [
    Path('client'),
    Path('src'),
    Path('shared'),
    Path('server'),
    Path('netlify'),
    Path('public'),
]

changed_files = []

for base in ROOTS:
    if not base.exists():
        continue
    for path in base.rglob('*'):
        if not path.is_file():
            continue
        if path.suffix not in SUFFIXES:
            continue
        if any(part in IGNORED_DIRS for part in path.parts):
            continue
        try:
            text = path.read_text(encoding='utf-8')
        except UnicodeDecodeError:
            continue
        if 'Omnis' not in text:
            continue
        new_text = text.replace('Omnis', 'Polaris')
        if new_text != text:
            path.write_text(new_text, encoding='utf-8')
            changed_files.append(str(path))

if changed_files:
    print('Updated files:')
    for f in changed_files:
        print(f)
else:
    print('No changes made.')
