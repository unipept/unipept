
BEGIN {
    FS = ": *"
    OFS = "\t"
}
NR == 1 { # beginning the first file
    i = 1
    f = FILENAME
    sub(".assembly.txt", "", f)
    sub(".*/", "", f)
}
NR != 1 && FNR == 1 { # starting a next file
    # printing the assembly from the previous file
    print i, f, assembly["Assembly level"], \
          assembly["Assembly Name"], \
          assembly["BioSample"], \
          assembly["GenBank Assembly Accession"], \
          assembly["Genome representation"], \
          assembly["Organism name"], \
          assembly["RefSeq Assembly Accession"], \
          assembly["Taxid"] >> assemblies_file
    split("", assembly, ":") # deleting array
    # setting up the next file
    i += 1
    f = FILENAME
    sub(".assembly.txt", "", f)
    sub(".*/", "", f)
}
FNR == 1,/^#\W*$/ {
    key = $1
    sub("# ", "", key)
    value = $0
    sub("[^:]*:[ \t]*", "", value)
    gsub("[ \t\r]+", " ", value)
    assembly[key] = value;
}
!/^#/ {
    print i, $0 >> genome_sequences_file
}
END {
}
