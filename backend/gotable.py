import sys

seg, pkey, go, name, namespace, deff=False, 1, "", "", "", ""
for line in open(sys.argv[1]):
	line=line.strip()
	if line[0:6] == "[Term]" or seg:
		seg=True
		if line == "":
			print("{}\t{}\t{}\t{}".format(pkey, go, name, namespace))
			pkey+=1
			seg, go, name, namespace, deff=False, "", "", "", ""
		elif line[0:3] == "id:":
			go=line.split("d: ")[-1]
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
