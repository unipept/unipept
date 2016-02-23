#!/usr/bin/env python

import sys
import gzip


mapping=sys.argv[1]
pathway=sys.argv[2]
ecnumber=sys.argv[3]

def readFile(rfile):
	return open(rfile, "r")

def readGzFile(rfile):
	return gzip.open(rfile, "r")

def addToDict(ecfile, mapfile):
	dict_ids=dict()
	for rfile in [mapfile, ecfile]:
		for line in rfile:
			line=line.decode("utf-8", "ignore")
			line=line.strip().split("\t")
			if line[1] not in dict_ids:
				dict_ids[line[1]]=line[0]
			else: raise "you cant have double ids in your database!"
	return dict_ids

def parseMapFile(rfile, dict_ids):
	pkey=0
	for line in rfile:
		ec_id, kegg_path_id=line.strip().split("\t")
		ec_id, kegg_path_id=ec_id[3:], kegg_path_id[5:]
		pkey+=1
		if ec_id in dict_ids and kegg_path_id in dict_ids:
			print("{}\t{}\t{}".format(pkey, dict_ids[ec_id], dict_ids[kegg_path_id]))
		# below this code should actually not happen. but still needs testing!
		elif ec_id in dict_ids and kegg_path_id not in dict_ids:
			print("{}\t{}\t{}".format(pkey, dict_ids[ec_id], "Null"))
		elif ec_id not in dict_ids and kegg_path_id in dict_ids:
			print("{}\t{}\t{}".format(pkey, "Null", dict_ids[kegg_path_id]))
		else: print("{}\t{}\t{}".format(pkey, "Null", "Null"))


dict_ids=addToDict(readGzFile(pathway), readGzFile(ecnumber))
parseMapFile(readFile(mapping), dict_ids)
