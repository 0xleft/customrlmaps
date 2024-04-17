content = open("build/index.html", "r").read()
content = content.replace('href="/', 'href="')
content = content.replace('src="/', 'src="')
print(content)
open("build/index.html", "w+").write(content)

print("Fixed paths in index.html")