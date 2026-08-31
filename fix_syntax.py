path = 'src/lib/store/initialData.ts'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(\"qu'AstAcrix\", \"qu\\'AstAcrix\")
with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
