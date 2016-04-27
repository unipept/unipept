import os
import sys
import gzip
import argparse

parser = argparse.ArgumentParser(description='Get cross reference aggregation.')
parser.add_argument('-s', metavar="Sequences file", nargs='?', type=str,
                   help='input sequences file')
parser.add_argument('-p', metavar="Peptides file", nargs='?', type=str,
                   help='input peptides file')
parser.add_argument('-e', metavar="EC file", nargs='?', type=str,
                   help='input ec crossref file')
parser.add_argument('-g', metavar="GO file", nargs='?', type=str,
                   help='input go crossref file')
parser.add_argument('-i', metavar="InterPro file", nargs='?', type=str,
                   help='input interpro crossref file')
parser.add_argument('-o', metavar="Output path", nargs='?', type=str, default="../../data/intermediate",
                   help='output file (default ../../data/intermediate)')
args = parser.parse_args()

def readFile(rfile):
    ext = os.path.splitext(rfile)[1]
    if ext == '.gz': f = gzip.open(rfile, "r")
    else: f = open(rfile, "r")
    return f

def getSequenceTable():
	global seqdir_lca
	global seqdir_lcail

	tabFile=readFile(args.s)

	for line in tabFile:
		line = line.strip().split("\t")
		# key: ids; values: []
		if line[2] != "\\N":
			seqdir_lca[line[0]] = []
		if line[3] != "\\N":
			seqdir_lcail[line[0]] = []		

def getPeptideTable():
	global pepdir_lca
	global pepdir_lcail

	tabFile=readFile(args.p)

	for line in tabFile:
		line = line.strip().split("\t")
		if line[1] in seqdir_lca:
			if line[1] not in pepdir_lca:
				# key: sequence_id or origenal_sequence_id; value: uniprot_entry_id
				pepdir_lca[line[1]] = [line[3]]
			else: pepdir_lca[line[1]] += [line[3]]
		if line[2] in seqdir_lcail:
			if line[2] not in pepdir_lcail:
				# key: sequence_id or origenal_sequence_id; value: uniprot_entry_id
				pepdir_lcail[line[2]] = [line[3]]
			else: pepdir_lcail[line[2]] += [line[3]]

def getCrossrefTable(crossref):
	global crossdir

	tabFile=readFile(crossref)

	for line in tabFile:
		line = line.strip().split("\t")

		if line[1] not in crossdir:
			# key: uniprot_entry_id; value: crossref value
			crossdir[line[1]] = [line[3]]
		else: crossdir[line[1]] += [line[3]]

def getCrossrefData():
	global resultdir_lca
	global resultdir_lcail

	for key, value in pepdir_lca.items():
		values = set(value)
		for val in values:
			if val in crossdir:
				if key not in resultdir_lca:
					resultdir_lca[key] = {}
				if val not in resultdir_lca[key]:
					resultdir_lca[key][val] = set()
				else: raise "can this happen?"
				resultdir_lca[key][val].update(crossdir[val])

	for key, value in pepdir_lcail.items():
		values = set(value)
		for val in values:
			if val in crossdir:
				if key not in resultdir_lcail:
					resultdir_lcail[key] = {}
				if val not in resultdir_lcail[key]:
					resultdir_lcail[key][val] = set()
				else: raise "can this happen?"
				resultdir_lcail[key][val].update(crossdir[val])

def thresholdRatio(aggrdir):
	values = aggrdir.values()
	if len(values) > 1:
		values.sort()
		values.reverse()
		maxperc = values[0]
		for key, value in aggrdir.items():
			ratio = float(value)/float(maxperc)
			if ratio < 0.1:
				del aggrdir[key]
	return aggrdir

def aggregation(crossfile):
	global crossdir
	
	il=""
	crossdir={}
	for dirc in [resultdir_lca, resultdir_lcail]:
		fileout=gzip.open(outdir+crossfile+"_lca"+il+".tsv.gz", "w")
		il = "_il"
		for key, value in dirc.items():
			aggrdir={}
			totalperc = float(100)/float(len(value))
			for k, v in value.items():
				for ec in v:
					if ec not in aggrdir:
						aggrdir[ec] = totalperc
					else: aggrdir[ec] += totalperc
			result=thresholdRatio(aggrdir)
			fileout.write("{}\t{}\n".format(key, ",".join(result.keys())))
			#print ("{}\t{}".format(key, ",".join(result.keys())))

if __name__=="__main__":
	seqdir_lca={}
	seqdir_lcail={}
	pepdir_lca={}
	pepdir_lcail={}

	getSequenceTable()
	getPeptideTable()
	outdir= args.o if args.o[-1] == "/" else args.o+"/"
	for cr in [args.e, args.g, args.i]:
		crossfile=cr.split("/")[-1].split(".")[0]
		crossdir={}
		resultdir_lca={}
		resultdir_lcail={}
		getCrossrefTable(cr)
		getCrossrefData()
		aggregation(crossfile)

		
