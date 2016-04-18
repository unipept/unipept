import sys
import gzip

sequences=sys.argv[1]
peptides=sys.argv[2]
crossref=sys.argv[3]

seqdir={}
pepdir={}
crossdir={}
resultdir={}

def readFile(rfile):
	return gzip.open(rfile, "r")

def getSequenceTable(sequences, lcaC):
	global seqdir

	tabFile=readFile(sequences)
	lca = 2 if lcaC == "lca" else 3

	for line in tabFile:
		line = line.strip().split("\t")
		# key: ids; values: sequence, lca or lca_il
		if line[lca] != "\\N":
			seqdir[line[0]] = [line[1], line[lca]]

def getPeptideTable(peptides, lcaC):
	global pepdir

	tabFile=readFile(peptides)
	lca = 1 if lcaC == "lca" else 2

	for line in tabFile:
		line = line.strip().split("\t")
		if line[lca] in seqdir:
			if line[lca] not in pepdir:
				# key: sequence_id or origenal_sequence_id; value: uniprot_entry_id
				pepdir[line[lca]] = [line[3]]
			else: pepdir[line[lca]] += [line[3]]

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
	global resultdir

	for key, value in pepdir.items():
		values = set(value)
		for val in values:
			if val in crossdir:
				if seqdir[key][0] not in resultdir:
					resultdir[seqdir[key][0]] = set()
				resultdir[seqdir[key][0]].update(crossdir[val])

def thresholdRatio(aggrdir):
	values = aggrdir.values()
	if len(values) > 1:
		values.sorted()
		maxperc = values[0]
		for key, value in aggrdir.items():
			print (key, value)
			ratio = float(value)/float(maxperc)
			if ratio < 0.1:
				del aggrdir[key]
	return aggrdir

def aggregation():
	print (resultdir)
	raise
	for key, value in resultdir.items():
		aggrdir={}
		totalperc = float(100)/float(len(value))
		for group in value:
			for val in group:
				print (group, val)
				if val not in aggrdir.items():
					aggrdir[val] = totalperc
				else: aggrdir[val] += totalperc
		result=thresholdRatio(aggrdir)
		print (",".join(result.keys()))


getSequenceTable(sequences, 'lca')
getPeptideTable(peptides, 'lca')
getCrossrefTable(crossref)
getCrossrefData()
aggregation()

		
