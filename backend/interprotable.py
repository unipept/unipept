#!/usr/bin/env python

import sys
import gzip


def addToDict(rfile):
	dict_ids=dict()
	for line in rfile:
		line=line.strip().split("\t")
		if line[2] not in dict_ids:
			dict_ids[line[2]]=line[0]
		else: raise "you cant have double ids in your database!"
	return dict_ids

def parseTSV(temp, dict_ids):
	for line in temp:
		line=line.strip().split("\t")
		print("{}\t{}\t{}\t{}\t{}".format(line[0], dict_ids[line[1]], line[2], line[3], line[4]))

def getType(types):
	if types.lower()=="active_site": return "AS"
	elif types.lower()=="binding_site": return "BS"
	elif types.lower()=="conserved_site": return "CS"
	elif types.lower()=="domain": return "D"
	elif types.lower()=="family": return "F"
	elif types.lower()=="repeat": return "R"
	else: return "PTM"

def parseIntPXML():
	import xml.etree.ElementTree as ET

	tree = ET.parse(gzip.open(sys.argv[1]))
	root = tree.getroot()

	temp=[]
	pkey=0
	for child in root.getchildren():
		if child.tag == "interpro":
			attr=child.attrib
			pkey+=1
			parent=attr.get("id")
			intid=attr.get("id")
			name=attr.get("short_name")
			types=getType(attr.get("type"))
			for nchild in child.iter("parent_list"):
				parent=nchild.getchildren()[0].get("ipr_ref")
			temp.append("{}\t{}\t{}\t{}\t{}".format(pkey, parent, intid, name, types))
	parseTSV(temp, addToDict(temp))

parseIntPXML()
