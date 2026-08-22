import os
import re

# 1. Rename files with kyzer in the filename
renames = [
    ('KYZER_HANDOFF_v3.md', 'KYZER_HANDOFF_v3.md'),
    ('docs/KYZER_PITCH_DECK.md', 'docs/KYZER_PITCH_DECK.md'),
    ('outputs/kyzer_copilot_dashboard.html', 'outputs/kyzer_copilot_dashboard.html'),
]

for old_p, new_p in renames:
    if os.path.exists(old_p):
        os.rename(old_p, new_p)
        print(f'Renamed: {old_p} -> {new_p}')

# 2. Text replacements across all files
extensions = ('.ts', '.tsx', '.py', '.json', '.html', '.md', '.css', '.yml', '.yaml')
exclude_dirs = {'.git', 'node_modules', '.venv', 'dist', '__pycache__'}

def replace_in_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception:
        return

    orig = content
    # Order matters: exact case matches first
    content = content.replace('KYZER', 'KYZER')
    content = content.replace('KYZER', 'KYZER')
    content = content.replace('KYZER', 'KYZER')
    content = content.replace('kyzer-frontend', 'kyzer-frontend')
    content = content.replace('kyzer_copilot_dashboard.html', 'kyzer_copilot_dashboard.html')
    content = content.replace('KYZER_PITCH_DECK.md', 'KYZER_PITCH_DECK.md')
    content = content.replace('KYZER_HANDOFF_v3.md', 'KYZER_HANDOFF_v3.md')
    content = content.replace('kyzer', 'kyzer')

    if content != orig:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'Updated text in: {filepath}')

for root, dirs, files in os.walk('.'):
    # prune excluded dirs
    dirs[:] = [d for d in dirs if d not in exclude_dirs]
    for f in files:
        if f.endswith(extensions):
            p = os.path.join(root, f)
            replace_in_file(p)

print('Brand renaming to KYZER complete!')