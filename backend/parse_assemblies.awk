
BEGIN {
    FS = ": *"
    OFS = "\t"
}
NR == 1 { # beginning the first file
    assembly_id = 1
    sequence_id = 1
    parse_it = 0
}
/GenBank Assembly Accession: .* \(latest\)/ {
    parse_it = 1
}
NR != 1 && /^# Assembly Name/ { # starting a next file
    # printing the assembly from the previous file
    if(parse_it) {
        parse_it = 0
        genbankacc = assembly["GenBank Assembly Accession"]
        sub(/ .*/, "", genbankacc)
        refseqacc = assembly["RefSeq Assembly Accession"]
        sub(/ .*/, "", refseqacc)
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
}
/^# Assembly Name/,/^#\W*$/ {
    key = $1
    sub("# ", "", key)
    value = $0
    sub(/[^:]*:[ \t]*/, "", value)
    gsub(/[ \t\r]+/, " ", value)
    assembly[key] = value;
}
!/^#/ && parse_it {
    print sequence_id, assembly_id, $0 >> assembly_sequences_file
    sequence_id += 1
}
END {
}
