#!/usr/bin/env python

import sys
import gzip
import xml.etree.ElementTree as ET


tree = ET.parse(gzip.open(sys.argv[1]))
root = tree.getroot()

pkey=0
for child in root.getchildren():
	if child.tag == "interpro":
		attr=child.attrib
		pkey+=1
		parent=attr.get("id")
		intid=attr.get("id")
		name=attr.get("short_name")
		types=" ".join(attr.get("type").split("_"))
		for nchild in child.iter("parent_list"):
			parent=nchild.getchildren()[0].get("ipr_ref")
		print("{}\t{}\t{}\t{}\t{}".format(pkey, parent, intid, name, types))

