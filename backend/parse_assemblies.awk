
BEGIN {
    FS = ": *"
    OFS = "\t"
}
NR == 1 { # beginning the first file
    assembly_id = 1
    sequence_id = 1
    genbankacc = FILENAME
    sub(/.*\//, "", genbankacc)
    sub(/\..*/, "", genbankacc)
    parse_it = 0
}
/GenBank Assembly Accession: .* \(latest\)/ {
    parse_it = 1
}
NR != 1 && FNR == 1 { # starting a next file
    # printing the assembly from the previous file
    if(parse_it) {
        parse_it = 0
        refseqacc = assembly["RefSeq Assembly Accession"]
        sub(/\..*/, "", refseqacc)
        print assembly_id \
            , genbankacc \
            , refseqacc \
            , assembly["Taxid"] \
            , assembly["Genome representation"] \
            , assembly["Assembly level"] \
            , assembly["Assembly Name"] \
            , assembly["Organism name"] \
            , assembly["BioSample"] \
              >> assemblies_file
        assembly_id += 1
    }
    split("", assembly, ":") # deleting array
    # setting up the next file
    genbankacc = FILENAME
    sub(/.*\//, "", genbankacc)
    sub(/\..*/, "", genbankacc)
}
FNR == 1,/^#\W*$/ {
    key = $1
    sub("# ", "", key)
    value = $0
    sub(/[^:]*:[ \t]*/, "", value)
    gsub(/[ \t\r]+/, " ", value)
    assembly[key] = value;
}
!/^#/ && parse_it {
    print sequence_id, assembly_id, $5, $4 >> assembly_sequences_file
    sequence_id += 1
}
END {
}
