#!/usr/bin/env python

import sys
import gzip
import argparse

parser = argparse.ArgumentParser(description='Get GO terms.')
parser.add_argument('-i', metavar="EC/GO/InterPro file", nargs='?', type=str,
                   help='input file')
parser.add_argument('-c', metavar="Crossref file", nargs='?', type=str,
                   help='input crossref file')
parser.add_argument('-k', metavar="Column position", nargs='?', type=int,
                   help='input column number file')
parser.add_argument('-a', metavar="Alt ids file", nargs='?', type=str, default="",
                   help='input alt id file')
args = parser.parse_args()

def readFile(rfile):
	return gzip.open(rfile, "r")

def addToDict(rfile):
	dict_ids=dict()
	for line in rfile:
		line=line.decode("utf-8", "ignore")
		line=line.strip().split("\t")
		if line[args.k] not in dict_ids:
			dict_ids[line[args.k]]=line[0]
		else: raise "you cant have double ids in your database!"
	return dict_ids

def parseCrossRef(rfile, dict_ids, dict_alt_ids={}):
	for line in rfile:
		line=line.decode("utf-8", "ignore")
		line=line.strip().split("\t")
		goid=line[-1]
		if dict_alt_ids != {}:
			if goid in dict_alt_ids:
				goid=dict_alt_ids[line[-1]]
		if goid in dict_ids:
			print("{}\t{}\t{}\t{}".format(line[0], line[1], dict_ids[goid], goid))
		#else:
		#	print("{}\t{}\t{}\t{}".format(line[0], line[1], "Null", line[-1]))

def getAltIds(rfile):
	dict_alt_ids={}
	for line in rfile:
		line=line.strip().split("\t")
		for item in line[1:]:
			dict_alt_ids[item]=line[0]
	return dict_alt_ids

dict_alt_ids={}
if args.a != "": dict_alt_ids=getAltIds(readFile(args.a))
dict_ids=addToDict(readFile(args.i))
parseCrossRef(readFile(args.c), dict_ids, dict_alt_ids)

