#!/usr/bin/env python

import sys
import os
import gzip
import argparse

parser = argparse.ArgumentParser(description='Get GO terms.')
parser.add_argument('-g', metavar="Obo file", nargs='?', type=str,
                   help='input Obo file')
parser.add_argument('-o', metavar="Output go file", nargs='?', type=str, default="",
                   help='output go file')
parser.add_argument('-a', metavar="Output alt ids file", nargs='?', type=str, default="",
                   help='output alt ids file')
args = parser.parse_args()


seg, pkey, go, name, namespace, deff, alt_id=False, 1, "", "", "", "", []
save_go=gzip.open(args.o, "w")
save_alt=gzip.open(args.a, "w")
for line in open(args.g, "r"):
	line=line.strip()
	if line[0:6] == "[Term]" or seg:
		seg=True
		if line == "":
			#print("{}\t{}\t{}\t{}".format(pkey, go, name, namespace))
			save_go.write("{}\t{}\t{}\t{}\n".format(pkey, go, name, namespace))
			if alt_id != []:
				save_alt.write("{}\t{}\n".format(go, "\t".join(alt_id)))
				#print("{}\t{}".format(go, "\t".join(alt_id)))
				alt_id = []
			pkey+=1
			seg, go, name, namespace, deff=False, "", "", "", ""
		elif line[0:3] == "id:":
			go=line.split("d: ")[-1]
		elif line[0:6] == "alt_id":
			alt_id.append(line.split("alt_id: ")[-1])
		elif line[0:5] == "name:":
			name=line.split("ame: ")[-1]
		elif line[0:10] == "namespace:":
			temp=line.split("amespace: ")[-1]
			if temp == "biological_process": namespace="BP"
			elif temp == "molecular_function": namespace="MF"
			elif temp == "cellular_component": namespace="CC"
		# optional description (default off) (add to print format to include)
		#elif line[0:4] == "def:":
		#	deff=line.split("ef: ")[-1].split('." [')[0][1:]
