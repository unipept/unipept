import sys

enzymes=sys.argv[1]
classes=sys.argv[2]

counter = 0

def readFile(rfile):
	return open(rfile, "r")

def parseFileEnzymes(enzymes):
	global counter

	title, desc = "", False
	rfile=readFile(enzymes)
	for line in rfile:
		if line[:2] == "ID":
			counter += 1
			desc = True
			title = line.split(" ", 1)[-1].strip()
		elif desc and line[:2] == "DE":
			line = line.split(" ", 1)[-1].replace("'","")
			line = line.strip()[:-1] if line.strip()[-1] == "." else line.strip()
			desc = False
			print str(counter)+"\t"+title+"\t"+line

def parseFileClasses(classes):
	global counter
	import re

	rfile=readFile(classes)
	for line in rfile:
		match = re.search("^[0-9]+.", line)
		if match:
			counter += 1
			ecs, desc = line.split("  ", 1)
			ids = "".join(ecs.split())
			desc = desc.strip()[:-1] if line.strip()[-1] == "." else line.strip()
			print str(counter)+"\t"+ids+"\t"+desc

parseFileEnzymes(enzymes)
parseFileClasses(classes)
