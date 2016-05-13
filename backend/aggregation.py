import os
import sys
import gzip
import argparse
import subprocess

parser = argparse.ArgumentParser(description='Get cross reference aggregation.')
parser.add_argument('-p', metavar="Peptides file", nargs='?', type=str,
                   help='input peptides file')
parser.add_argument('-e', metavar="EC file", nargs='?', type=str,
                   help='input ec crossref file')
parser.add_argument('-g', metavar="GO file", nargs='?', type=str,
                   help='input go crossref file')
parser.add_argument('-i', metavar="InterPro file", nargs='?', type=str,
                   help='input interpro crossref file')
parser.add_argument('-l', metavar="LCA type", nargs='?', type=str,
                   help='input LCA or LCA_IL')
parser.add_argument('-o', metavar="Output path", nargs='?', type=str, default="../../data/intermediate",
                   help='output file (default ../../data/intermediate)')
args = parser.parse_args()

def fileType(tfile):
    ext = os.path.splitext(tfile)[1]
    return "gz" if ext == '.gz' else ""  	

def readFile(rfile):
    ext = os.path.splitext(rfile)[1]
    if ext == '.gz': f = gzip.open(rfile, "r")
    else: f = open(rfile, "r")
    return f	

def getPeptideTable():
	peptide_table=readFile(args.p)
	mem, first, uni_entries= "", True, []
	for line in peptide_table:
		ids, lca_seq_id, org_seq_id, uni_entry = line.strip().split("\t")
		seq_id = lca_seq_id if args.l == "lca_il" else org_seq_id
		if first == True:
			mem = seq_id
			first = False
		if mem != seq_id:
			aggregation()
			mem = seq_id
		#print (ids, seq_id, org_seq_id, uni_entry)
		getCrossrefData(seq_id, uni_entry)

def getCrossrefTable(crossref):
	global crossdir

	for line in readFile(crossref):
		line = line.strip().split("\t")
		if line[1] not in crossdir:
			# key: uniprot_entry_id; value: crossref ec/go/interpro
			crossdir[line[1]] = [line[3]]
		else: crossdir[line[1]] += [line[3]]

def getCrossrefData(seq_id, uniprot_entry_id):
	global ec_dir

	write = True
	if uniprot_entry_id in crossdir:
		if seq_id not in ec_dir:
			ec_dir[seq_id] = {}
		if uniprot_entry_id not in ec_dir[seq_id]:
			ec_dir[seq_id][uniprot_entry_id] = set()
		else: write = False
		
		if write:
			ec_dir[seq_id][uniprot_entry_id].update(crossdir[uniprot_entry_id])

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

def aggregation():
	global crossdir
	global ec_dir
	global wfile
	
	seq_id_counter = 1
	for key, value in ec_dir.items():
		aggrdir={}
		totalperc = float(100)/float(len(value))
		for k, v in value.items():
			for ec in v:
				if ec not in aggrdir:
					aggrdir[ec] = totalperc
				else: aggrdir[ec] += totalperc
		reduced=thresholdRatio(aggrdir)
		if loopfile == 1:
			reduced=ec_lca_aggregation(reduced.keys())
		elif loopfile == 2: ""
		else: ""
		wfile.write("{}\t{}\n".format(key, ";".join(reduced)))

		#print ("{}\t{}".format(key, ",".join(lca)))
	ec_dir = {}

def ec_lca_aggregation(ec_list):
	ontology = []
	if len(ec_list) <= 1:
		return ec_list
	else:
		ec_split = [ec.split(".") for ec in ec_list]
		class_lev = set([le[0] for le in ec_split])
		for cl in class_lev:
			ecnumber = []
			cl_cluster = [ec for ec in ec_split if ec[0] == cl]
			for i in range(0,4):
				merge = set([level[i] for level in cl_cluster])
				if len(merge) == 1:
					ecnumber.append(str(list(merge)[0])+".")
				else: 
					ecnumber.append("-."*(4-i))
					break
			ecnumber[-1] = ecnumber[-1][:-1]
			ontology.append("".join(ecnumber))
		return ontology

if __name__=="__main__":
	loopfile = 0

	outdir= args.o if args.o[-1] == "/" else args.o+"/"
	for cr in [args.e, args.g, args.i]:
		wfile = file
		crossdir = {}
		ec_dir = {}
		loopfile += 1
		crossfile=cr.split("/")[-1].split(".")[0]
		wfile=gzip.open(outdir+crossfile+"_"+args.l+".tsv.gz", "w")
		getCrossrefTable(cr)
		getPeptideTable()
