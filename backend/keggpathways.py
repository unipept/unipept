#!/usr/bin/env python

import sys

pkey=0
for line in open(sys.argv[1], "r"):
	pkey+=1
	long_id, name=line.strip().split("\t")
	long_id=long_id.split(":")[-1]
	print("{}\t{}\t{}".format(pkey, long_id, name))
