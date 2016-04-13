import sys
import gzip

sequences=sys.argv[1]
peptides=sys.argv[2]
crossref=sys.argv[3]

def readFile(rfile):
	return gzipopen()

def getSequenceTable(sequences):
	seqFile=readFile(sequences)

	header = seqFile.read()
	for line in seqFile:
		
