import os
import sys
import gzip
import argparse
import subprocess

parser = argparse.ArgumentParser(description='Get cross reference aggregation.')
parser.add_argument('-p', metavar="Peptides file", nargs='?', type=str,
                   help='input peptides file')
parser.add_argument('-e', metavar="EC cross file", nargs='?', type=str,
                   help='input ec crossref file', default="")
parser.add_argument('-n', metavar="EC number file", nargs='?', type=str,
                   help='input ec number file', default="")
parser.add_argument('-l', metavar="LCA type", nargs='?', type=str,
                   help='input LCA or LCA_IL', default="")
parser.add_argument('-o', metavar="Output path", nargs='?', type=str, default="./data/intermediate",
                   help='output file (default ../../data/intermediate)')
args = parser.parse_args()

def fileType(tfile):
    ext = os.path.splitext(tfile)[1]
    return "gz" if ext == '.gz' else ""  	

def readFile(rfile):
    ext = os.path.splitext(rfile)[1]
    if ext == '.gz': f = gzip.open(rfile, "r")
    else: f = open(rfile, "r", encoding='utf8')
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
		getCrossrefData(seq_id, uni_entry)
	aggregation()

def getECTable():
	global ec_dir

	ecFile = readFile(args.n)
	for line in ecFile:
		ids, ec, desc = line.strip().split("\t")
		ec_dir[ec] = ids

def getCrossrefTable(crossref):
	global crossdir

	for line in readFile(crossref):
		line = line.strip().split("\t")
		if line[1] not in crossdir:
			# key: uniprot_entry_id; value: crossref ec/go/interpro
			crossdir[line[1]] = [line[2]]
		else: crossdir[line[1]] += [line[2]]

def getCrossrefData(seq_id, uniprot_entry_id):
	global cross_data_dir

	write = True
	if uniprot_entry_id in crossdir:
		if seq_id not in cross_data_dir:
			cross_data_dir[seq_id] = {}
		if uniprot_entry_id not in cross_data_dir[seq_id]:
			cross_data_dir[seq_id][uniprot_entry_id] = set()
		else: write = False
		
		if write:
			cross_data_dir[seq_id][uniprot_entry_id].update(crossdir[uniprot_entry_id])

def thresholdRatio(aggrdir, rat = 0.1):
	values = aggrdir.values()
	if len(values) > 1:
		values.sort()
		values.reverse()
		maxperc = values[0]
		for key, value in aggrdir.items():
			ratio = float(value)/float(maxperc)
			if ratio < rat:
				del aggrdir[key]
	return aggrdir

def aggregation():
	global crossdir
	global cross_data_dir
	global wfile
	global ec_dir
	global seq_id_counter
	
	for key, value in cross_data_dir.items():
		aggrdir={}
		totalperc = float(100)/float(len(value))
		for k, v in value.items():
			for ec in v:
				if ec not in aggrdir:
					aggrdir[ec] = totalperc
				else: aggrdir[ec] += totalperc

		reduced=thresholdRatio(aggrdir)
		reduced=ec_lca_aggregation(reduced.keys())

		if (int(key) - seq_id_counter) > 1:
			for c in range((seq_id_counter+1), (int(key))):
				wfile.write("{}\t{}\n".format(c, "\\N"))
				#print ("{}\t{}".format(c, "\\N"))
		seq_id_counter = int(key)
		wfile.write("{}\t{}\n".format(key, reduced))
		#print ("{}\t{}".format(key, reduced))
	cross_data_dir = {}

def ec_lca_aggregation(ec_list):
	ontology = -1
	ecnumber = []
	if len(ec_list) <= 1:
		if "".join(ec_list) in ec_dir:
			ec_dir["".join(ec_list)]
		else: return 0
	else:
		ec_split = [ec.split(".") for ec in ec_list]
		for i in range(0,4):
			merge = set([level[i] for level in ec_split])
			if len(merge) == 1:
				ecnumber.append(str(list(merge)[0])+".")
			else: 
				ecnumber.append("-."*(4-i))
				break
		ecnumber[-1] = ecnumber[-1][:-1]
		ecnumber = "".join(ecnumber)
		return 0 if ecnumber == "-.-.-.-" else ec_dir[ecnumber]

if __name__=="__main__":
	global cr

	outdir = args.o if args.o[-1] == "/" else args.o+"/"
	for cr in [args.e]:

		# for empty input
		if args.e == "" or args.n == "" or args.p == "" or args.l == "":
			raise "an input has not been given!"

		# variables
		seq_id_counter = 1
		ec_dir = {}
		wfile = file
		crossdir = {}
		cross_data_dir = {}

		# create output file
		crossfile=os.path.basename(cr).split(".")[0]
		wfile=gzip.open(outdir+crossfile+"_"+args.l+".tsv.gz", "w")

		# get data from tsv files
		getECTable()
		getCrossrefTable(cr)
		getPeptideTable()
