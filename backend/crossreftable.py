import sys
import gzip

fdb_file=sys.argv[1]
cross_file=sys.argv[2]
take_pos=int(sys.argv[3])

def readFile(rfile):
	return gzip.open(rfile, "r")

def addToDict(rfile):
	dict_ids=dict()
	for line in rfile:
		line=line.decode("utf-8", "ignore")
		line=line.strip().split("\t")
		if line[take_pos] not in dict_ids:
			dict_ids[line[take_pos]]=line[0]
		else: raise "you cant have double ids in your database!"
	return dict_ids

def parseCrossRef(rfile, dict_ids):
	for line in rfile:
		line=line.decode("utf-8", "ignore")
		line=line.strip().split("\t")
		if line[-1] in dict_ids:
			print("{}\t{}\t{}\t{}".format(line[0], line[1], dict_ids[line[-1]], line[-1]))
		else:
			print("{}\t{}\t{}\t{}".format(line[0], line[1], "Null", line[-1]))

dict_ids=addToDict(readFile(fdb_file))
parseCrossRef(readFile(cross_file), dict_ids)

