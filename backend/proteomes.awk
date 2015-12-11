BEGIN{
    OFS="\t"
    strain = "\\N"
    assembly = "\\N"
}
/^Proteome name/{
    name = $0
    sub(/^.*  +/, "", name)
    sub(/ - Reference proteome$/, "", name)

    reference = match($0, /Reference proteome$/) == 0 ? "\x00" : "\x01"
}
/^Strain/ && strain == "\\N"{
    strain = $0
    sub(/^Strain */, "", strain)
    if (strain == "")
        strain = "\\N"
}
/^Genome assembly/{
    assembly = $0
    sub(/^Genome assembly */, "", assembly)
    if (assembly == "")
        assembly = "\\N"
}
END{
    print id, accession, name, "\\N", "\x00", reference, strain, assembly
}
