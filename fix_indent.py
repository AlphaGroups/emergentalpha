import re

filepath = 'backend/server.py'
with open(filepath, 'r') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if 'res.data[0] if res.data else None' in line:
        # Check previous line's indentation
        prev_line = lines[i-1]
        indent = len(prev_line) - len(prev_line.lstrip())
        lines[i] = ' ' * indent + line.lstrip()

with open(filepath, 'w') as f:
    f.writelines(lines)
print("Indentation fixed.")
