<template>
    <v-container>
        <h1 class="font-weight-light">
            unipept pept2ec
        </h1>
        <h3 class="font-weight-light">Returns the functional <initialism>EC</initialism>-numbers associated with a given tryptic peptide.</h3>

        <v-divider class="my-2" />

        <p>
            The <inline-code>unipept pept2ec</inline-code> command takes one or more tryptic peptides as input and returns a list of <initialism>EC</initialism>-numbers for each
            of them as output. The <initialism>EC</initialism>-numbers are all derived from the UniProt entries that contain the given peptide. All this information
            is fetched by doing <r-link to="/apidocs/pept2ec" router><initialism>API</initialism>-requests</r-link> to the Unipept server.
        </p>

        <header-body-card
            id="input"
            title="Input"
            large-title
        >
            <p>
                The <inline-code>unipept pept2ec</inline-code> command expects tryptic peptides as input. The source of this input can be command line arguments, a file, or
                <i>standard input</i>. If input is supplied using multiple sources at the same time, the order of priority as described above is used.
            </p>

            <h3>Command line arguments</h3>
            <p>
                If input is supplied using command line arguments, the accession numbers must be separated by spaces.
            </p>

            <h4>Example</h4>
            <boxed>
                <sentinel>$</sentinel> unipept pept2ec AALTER MDGTEYIIVK
                <br>peptide,total_protein_count,ec_number,ec_protein_count
                <br>AALTER,1425,2.3.2.27 2.7.13.3 6.2.1.3 6.1.1.6 6.3.2.13 2.7.4.25 6.1.1.22 3.1.26.- 2.3.1.29 2.7.1.15 2.3.1.234 2.1.1.13 4.2.1.17 6.3.2.8 3.1.3.3 2.7.4.16 2.4.-.- 5.3.1.1 3.1.4.- 2.8.1.7 6.5.1.2 6.1.1.2 3.4.11.10 3.4.11.1 1.1.1.100 6.3.2.10 3.6.4.- 6.1.1.23 3.1.1.61 3.1.1.4 2.7.1.50 2.7.1.48 1.8.1.2 2.6.1.- 3.4.-.- 2.4.1.227 6.3.4.2 6.3.4.4 4.1.2.- 1.10.9.1 1.14.13.- 2.5.1.- 2.6.1.16 3.1.-.- 4.2.1.153 3.1.2.6 4.6.1.17 2.4.1.- 2.5.1.75 4.2.1.3 6.3.2.31 6.3.2.34 6.3.3.2 1.2.1.2 5.2.1.8 4.99.1.1 2.3.2.2 2.-.-.- 2.7.3.9 4.1.3.27 1.1.1.262 5.4.99.2 2.7.7.59 3.1.21.3 4.2.99.20 6.1.1.12 1.7.99.4,111 11 11 8 8 7 6 4 4 3 3 3 3 3 3 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
                <br>MDGTEYIIVK,4,,
            </boxed>

            <h3>File input</h3>
            <p>
                Use the <r-link to="#options" router>--input parameter</r-link> to specify a file to use as input. If input is supplied using a file, a single
                peptide per line is expected.
            </p>

            <h4>Example</h4>
            <boxed>
                <sentinel>$</sentinel> cat input.txt
                <br>AALTER
                <br>MDGTEYIIVK
                <br><sentinel>$</sentinel> unipept pept2ec --input input.txt
                <br>peptide,total_protein_count,ec_number,ec_protein_count
                <br>AALTER,1425,2.3.2.27 2.7.13.3 6.2.1.3 6.1.1.6 6.3.2.13 2.7.4.25 6.1.1.22 3.1.26.- 2.3.1.29 2.7.1.15 2.3.1.234 2.1.1.13 4.2.1.17 6.3.2.8 3.1.3.3 2.7.4.16 2.4.-.- 5.3.1.1 3.1.4.- 2.8.1.7 6.5.1.2 6.1.1.2 3.4.11.10 3.4.11.1 1.1.1.100 6.3.2.10 3.6.4.- 6.1.1.23 3.1.1.61 3.1.1.4 2.7.1.50 2.7.1.48 1.8.1.2 2.6.1.- 3.4.-.- 2.4.1.227 6.3.4.2 6.3.4.4 4.1.2.- 1.10.9.1 1.14.13.- 2.5.1.- 2.6.1.16 3.1.-.- 4.2.1.153 3.1.2.6 4.6.1.17 2.4.1.- 2.5.1.75 4.2.1.3 6.3.2.31 6.3.2.34 6.3.3.2 1.2.1.2 5.2.1.8 4.99.1.1 2.3.2.2 2.-.-.- 2.7.3.9 4.1.3.27 1.1.1.262 5.4.99.2 2.7.7.59 3.1.21.3 4.2.99.20 6.1.1.12 1.7.99.4,111 11 11 8 8 7 6 4 4 3 3 3 3 3 3 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
                <br>MDGTEYIIVK,4,,
            </boxed>

            <h3>Standard input</h3>
            <p>
                If the command is run without arguments and no file is specified, <inline-code>unipept pept2ec</inline-code> will read its input from <i>standard input</i>.
                When <i>standard input</i> is used, a single peptide per line is expected.
            </p>

            <h4>Example</h4>
            <boxed>
                <sentinel>$</sentinel> cat input.txt
                <br>AALTER
                <br>MDGTEYIIVK
                <br><sentinel>$</sentinel> cat input | unipept pept2funct
                <br>peptide,total_protein_count,ec_number,ec_protein_count
                <br>AALTER,1425,2.3.2.27 2.7.13.3 6.2.1.3 6.1.1.6 6.3.2.13 2.7.4.25 6.1.1.22 3.1.26.- 2.3.1.29 2.7.1.15 2.3.1.234 2.1.1.13 4.2.1.17 6.3.2.8 3.1.3.3 2.7.4.16 2.4.-.- 5.3.1.1 3.1.4.- 2.8.1.7 6.5.1.2 6.1.1.2 3.4.11.10 3.4.11.1 1.1.1.100 6.3.2.10 3.6.4.- 6.1.1.23 3.1.1.61 3.1.1.4 2.7.1.50 2.7.1.48 1.8.1.2 2.6.1.- 3.4.-.- 2.4.1.227 6.3.4.2 6.3.4.4 4.1.2.- 1.10.9.1 1.14.13.- 2.5.1.- 2.6.1.16 3.1.-.- 4.2.1.153 3.1.2.6 4.6.1.17 2.4.1.- 2.5.1.75 4.2.1.3 6.3.2.31 6.3.2.34 6.3.3.2 1.2.1.2 5.2.1.8 4.99.1.1 2.3.2.2 2.-.-.- 2.7.3.9 4.1.3.27 1.1.1.262 5.4.99.2 2.7.7.59 3.1.21.3 4.2.99.20 6.1.1.12 1.7.99.4,111 11 11 8 8 7 6 4 4 3 3 3 3 3 3 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
                <br>MDGTEYIIVK,4,,
            </boxed>
        </header-body-card>

        <header-body-card
            id="output"
            title="Output"
            class="mt-5"
            large-title
        >
            <p>
                The <inline-code>unipept pept2ec</inline-code> command outputs the list of associated <initialism>EC</initialism>-numbers for each of the (tryptic) input peptides
                that were found in the Unipept database. By default, the <initialism>EC</initialism>-number and peptide count are returned. By using the
                <r-link to="#options" router>--all parameter</r-link>, this can be supplemented with the name of the <initialism>EC</initialism>-number. Consult
                the <r-link to="/apidocs/pept2ec" router><initialism>API</initialism> documentation</r-link> for a detailed list of output fields. A selection of
                output fields can be specified with the <r-link to="#options" router>--select parameter</r-link>. By default, output is generated in csv format.
                By using the <r-link to="#options" router>--format parameter</r-link>, the format can be changed into json or xml. The output can be written to a file or to
                <i>standard output</i>.
            </p>

            <h3>File output</h3>
            <p>
                Use the <r-link to="#options" router>--output parameter</r-link> to specify an output file. If the file aready exists, the output will be
                appended to the end of the file.
            </p>

            <h4>Example</h4>
            <boxed>
                <sentinel>$</sentinel> unipept pept2ec --output output.txt AALTER MDGTEYIIVK
                <br><sentinel>$</sentinel> cat output.txt
                <br>peptide,total_protein_count,ec_number,ec_protein_count
                <br>AALTER,1425,2.3.2.27 2.7.13.3 6.2.1.3 6.1.1.6 6.3.2.13 2.7.4.25 6.1.1.22 3.1.26.- 2.3.1.29 2.7.1.15 2.3.1.234 2.1.1.13 4.2.1.17 6.3.2.8 3.1.3.3 2.7.4.16 2.4.-.- 5.3.1.1 3.1.4.- 2.8.1.7 6.5.1.2 6.1.1.2 3.4.11.10 3.4.11.1 1.1.1.100 6.3.2.10 3.6.4.- 6.1.1.23 3.1.1.61 3.1.1.4 2.7.1.50 2.7.1.48 1.8.1.2 2.6.1.- 3.4.-.- 2.4.1.227 6.3.4.2 6.3.4.4 4.1.2.- 1.10.9.1 1.14.13.- 2.5.1.- 2.6.1.16 3.1.-.- 4.2.1.153 3.1.2.6 4.6.1.17 2.4.1.- 2.5.1.75 4.2.1.3 6.3.2.31 6.3.2.34 6.3.3.2 1.2.1.2 5.2.1.8 4.99.1.1 2.3.2.2 2.-.-.- 2.7.3.9 4.1.3.27 1.1.1.262 5.4.99.2 2.7.7.59 3.1.21.3 4.2.99.20 6.1.1.12 1.7.99.4,111 11 11 8 8 7 6 4 4 3 3 3 3 3 3 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
                <br>MDGTEYIIVK,4,,
            </boxed>

            <h3>Standard output</h3>
            <p>
                If no output file is specified, <inline-code>unipept pept2ec</inline-code> will write its output to <i>standard output</i>.
            </p>

            <h4>Example</h4>
            <boxed>
                <sentinel>$</sentinel> unipept pept2ec AALTER MDGTEYIIVK
                <br>peptide,total_protein_count,ec_number,ec_protein_count
                <br>AALTER,1425,2.3.2.27 2.7.13.3 6.2.1.3 6.1.1.6 6.3.2.13 2.7.4.25 6.1.1.22 3.1.26.- 2.3.1.29 2.7.1.15 2.3.1.234 2.1.1.13 4.2.1.17 6.3.2.8 3.1.3.3 2.7.4.16 2.4.-.- 5.3.1.1 3.1.4.- 2.8.1.7 6.5.1.2 6.1.1.2 3.4.11.10 3.4.11.1 1.1.1.100 6.3.2.10 3.6.4.- 6.1.1.23 3.1.1.61 3.1.1.4 2.7.1.50 2.7.1.48 1.8.1.2 2.6.1.- 3.4.-.- 2.4.1.227 6.3.4.2 6.3.4.4 4.1.2.- 1.10.9.1 1.14.13.- 2.5.1.- 2.6.1.16 3.1.-.- 4.2.1.153 3.1.2.6 4.6.1.17 2.4.1.- 2.5.1.75 4.2.1.3 6.3.2.31 6.3.2.34 6.3.3.2 1.2.1.2 5.2.1.8 4.99.1.1 2.3.2.2 2.-.-.- 2.7.3.9 4.1.3.27 1.1.1.262 5.4.99.2 2.7.7.59 3.1.21.3 4.2.99.20 6.1.1.12 1.7.99.4,111 11 11 8 8 7 6 4 4 3 3 3 3 3 3 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
                <br>MDGTEYIIVK,4,,
                <br><sentinel>$</sentinel> unipept pept2go AALTER MDGTEYIIVK > output.txt
                <br><sentinel>$</sentinel> cat output.txt
                <br>peptide,total_protein_count,ec_number,ec_protein_count
                <br>AALTER,1425,2.3.2.27 2.7.13.3 6.2.1.3 6.1.1.6 6.3.2.13 2.7.4.25 6.1.1.22 3.1.26.- 2.3.1.29 2.7.1.15 2.3.1.234 2.1.1.13 4.2.1.17 6.3.2.8 3.1.3.3 2.7.4.16 2.4.-.- 5.3.1.1 3.1.4.- 2.8.1.7 6.5.1.2 6.1.1.2 3.4.11.10 3.4.11.1 1.1.1.100 6.3.2.10 3.6.4.- 6.1.1.23 3.1.1.61 3.1.1.4 2.7.1.50 2.7.1.48 1.8.1.2 2.6.1.- 3.4.-.- 2.4.1.227 6.3.4.2 6.3.4.4 4.1.2.- 1.10.9.1 1.14.13.- 2.5.1.- 2.6.1.16 3.1.-.- 4.2.1.153 3.1.2.6 4.6.1.17 2.4.1.- 2.5.1.75 4.2.1.3 6.3.2.31 6.3.2.34 6.3.3.2 1.2.1.2 5.2.1.8 4.99.1.1 2.3.2.2 2.-.-.- 2.7.3.9 4.1.3.27 1.1.1.262 5.4.99.2 2.7.7.59 3.1.21.3 4.2.99.20 6.1.1.12 1.7.99.4,111 11 11 8 8 7 6 4 4 3 3 3 3 3 3 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
                <br>MDGTEYIIVK,4,,
            </boxed>
        </header-body-card>

        <header-body-card
            id="fasta"
            title="Fasta support"
            class="mt-5"
            large-title
        >
            <p>
                The <inline-code>unipept pept2ec</inline-code> command supports input (from any source) in a fasta-like format (for example generated by the
                <r-link to="/clidocs/prot2pept" router>prot2pept command</r-link>). This format consists of a fasta header (a line starting with a >), followed by
                one or more lines containing one peptide each. When this format is detected, the output will automatically include an extra information field
                containing the corresponding fasta header.
            </p>

            <h4>Example</h4>
            <boxed>
                <sentinel>$</sentinel> cat input.txt
                <br>> header 1
                <br>AALTER
                <br>MDGTEYIIVK
                <br>> header 2
                <br>AALTER
                <br><sentinel>$</sentinel> unipept pept2ec --input input.txt
                <br>fasta_header,peptide,total_protein_count,ec_number,ec_protein_count
                <br>> header 1,AALTER,1425,2.3.2.27 2.7.13.3 6.2.1.3 6.1.1.6 6.3.2.13 2.7.4.25 6.1.1.22 3.1.26.- 2.3.1.29 2.7.1.15 2.3.1.234 2.1.1.13 4.2.1.17 6.3.2.8 3.1.3.3 2.7.4.16 2.4.-.- 5.3.1.1 3.1.4.- 2.8.1.7 6.5.1.2 6.1.1.2 3.4.11.10 3.4.11.1 1.1.1.100 6.3.2.10 3.6.4.- 6.1.1.23 3.1.1.61 3.1.1.4 2.7.1.50 2.7.1.48 1.8.1.2 2.6.1.- 3.4.-.- 2.4.1.227 6.3.4.2 6.3.4.4 4.1.2.- 1.10.9.1 1.14.13.- 2.5.1.- 2.6.1.16 3.1.-.- 4.2.1.153 3.1.2.6 4.6.1.17 2.4.1.- 2.5.1.75 4.2.1.3 6.3.2.31 6.3.2.34 6.3.3.2 1.2.1.2 5.2.1.8 4.99.1.1 2.3.2.2 2.-.-.- 2.7.3.9 4.1.3.27 1.1.1.262 5.4.99.2 2.7.7.59 3.1.21.3 4.2.99.20 6.1.1.12 1.7.99.4,111 11 11 8 8 7 6 4 4 3 3 3 3 3 3 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
                <br>> header 1,MDGTEYIIVK,4,,
                <br>> header 2,AALTER,1425,2.3.2.27 2.7.13.3 6.2.1.3 6.1.1.6 6.3.2.13 2.7.4.25 6.1.1.22 3.1.26.- 2.3.1.29 2.7.1.15 2.3.1.234 2.1.1.13 4.2.1.17 6.3.2.8 3.1.3.3 2.7.4.16 2.4.-.- 5.3.1.1 3.1.4.- 2.8.1.7 6.5.1.2 6.1.1.2 3.4.11.10 3.4.11.1 1.1.1.100 6.3.2.10 3.6.4.- 6.1.1.23 3.1.1.61 3.1.1.4 2.7.1.50 2.7.1.48 1.8.1.2 2.6.1.- 3.4.-.- 2.4.1.227 6.3.4.2 6.3.4.4 4.1.2.- 1.10.9.1 1.14.13.- 2.5.1.- 2.6.1.16 3.1.-.- 4.2.1.153 3.1.2.6 4.6.1.17 2.4.1.- 2.5.1.75 4.2.1.3 6.3.2.31 6.3.2.34 6.3.3.2 1.2.1.2 5.2.1.8 4.99.1.1 2.3.2.2 2.-.-.- 2.7.3.9 4.1.3.27 1.1.1.262 5.4.99.2 2.7.7.59 3.1.21.3 4.2.99.20 6.1.1.12 1.7.99.4,111 11 11 8 8 7 6 4 4 3 3 3 3 3 3 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
            </boxed>
        </header-body-card>

        <header-body-card
            id="options"
            title="Command-line options"
            class="mt-5"
            large-title
        >
            <h2>--equate / -e <span class="text-caption grey--text text--darken-2">Equate isoleucine and leucine</span></h2>

            <p>
                If the <inline-code>--equate</inline-code> flag is set, isoleucine (I) and leucine (L) are equated when matching tryptic peptides to UniProt entries. This is
                similar to checking the <i>Equate I and L?</i> checkbox when performing a search in the Unipept web interface.
            </p>

            <h4>Example</h4>
            <boxed>
                <sentinel>$</sentinel> unipept pept2ec LLELGAPDLLVR
                <br><sentinel>$</sentinel> unipept pept2ec <b>--equate</b> LLELGAPDLLVR
                <br>peptide,total_protein_count,ec_number,ec_protein_count
                <br>LLELGAPDLLVR,499,2.7.7.6,495
            </boxed>

            <h2>--input / -i <span class="text-caption grey--text text--darken-2">Specify an input file</span></h2>

            <p>
                All Unipept <initialism>CLI</initialism> commands can process input from 3 sources: command line arguments, a file, or <i>standard input</i>. The optional <inline-code>--input</inline-code>
                option allows you to specify an input file. The file should contain a single peptide per line.
            </p>

            <h4>Example</h4>
            <boxed>
                <sentinel>$</sentinel> cat input.txt
                <br>AALTER
                <br>OMGWTFBBQ
                <br>MDGTEYIIVK
                <br><sentinel>$</sentinel> unipept pept2ec <b>--input</b> input.txt
                <br>peptide,total_protein_count,ec_number,ec_protein_count
                <br>AALTER,1425,2.3.2.27 2.7.13.3 6.2.1.3 6.1.1.6 6.3.2.13 2.7.4.25 6.1.1.22 3.1.26.- 2.3.1.29 2.7.1.15 2.3.1.234 2.1.1.13 4.2.1.17 6.3.2.8 3.1.3.3 2.7.4.16 2.4.-.- 5.3.1.1 3.1.4.- 2.8.1.7 6.5.1.2 6.1.1.2 3.4.11.10 3.4.11.1 1.1.1.100 6.3.2.10 3.6.4.- 6.1.1.23 3.1.1.61 3.1.1.4 2.7.1.50 2.7.1.48 1.8.1.2 2.6.1.- 3.4.-.- 2.4.1.227 6.3.4.2 6.3.4.4 4.1.2.- 1.10.9.1 1.14.13.- 2.5.1.- 2.6.1.16 3.1.-.- 4.2.1.153 3.1.2.6 4.6.1.17 2.4.1.- 2.5.1.75 4.2.1.3 6.3.2.31 6.3.2.34 6.3.3.2 1.2.1.2 5.2.1.8 4.99.1.1 2.3.2.2 2.-.-.- 2.7.3.9 4.1.3.27 1.1.1.262 5.4.99.2 2.7.7.59 3.1.21.3 4.2.99.20 6.1.1.12 1.7.99.4,111 11 11 8 8 7 6 4 4 3 3 3 3 3 3 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
                <br>MDGTEYIIVK,4,,
            </boxed>

            <h2>--output / -o <span class="text-caption grey--text text--darken-2">Specify an output file</span></h2>

            <p>
                By default, the unipept commands write their output to <i>standard output</i>. Using the optional <inline-code>--output</inline-code> option allows you to
                specify a file to write the output to. If the file already exists, the output will be appended; if it doesn't, a new file will be created.
            </p>

            <h4>Example</h4>
            <boxed>
                <sentinel>$</sentinel> unipept pept2ec <b>--output</b> output.txt AALTER
                <br><sentinel>$</sentinel> cat output.txt
                <br>peptide,total_protein_count,ec_number,ec_protein_count
                <br>AALTER,1425,2.3.2.27 2.7.13.3 6.2.1.3 6.1.1.6 6.3.2.13 2.7.4.25 6.1.1.22 3.1.26.- 2.3.1.29 2.7.1.15 2.3.1.234 2.1.1.13 4.2.1.17 6.3.2.8 3.1.3.3 2.7.4.16 2.4.-.- 5.3.1.1 3.1.4.- 2.8.1.7 6.5.1.2 6.1.1.2 3.4.11.10 3.4.11.1 1.1.1.100 6.3.2.10 3.6.4.- 6.1.1.23 3.1.1.61 3.1.1.4 2.7.1.50 2.7.1.48 1.8.1.2 2.6.1.- 3.4.-.- 2.4.1.227 6.3.4.2 6.3.4.4 4.1.2.- 1.10.9.1 1.14.13.- 2.5.1.- 2.6.1.16 3.1.-.- 4.2.1.153 3.1.2.6 4.6.1.17 2.4.1.- 2.5.1.75 4.2.1.3 6.3.2.31 6.3.2.34 6.3.3.2 1.2.1.2 5.2.1.8 4.99.1.1 2.3.2.2 2.-.-.- 2.7.3.9 4.1.3.27 1.1.1.262 5.4.99.2 2.7.7.59 3.1.21.3 4.2.99.20 6.1.1.12 1.7.99.4,111 11 11 8 8 7 6 4 4 3 3 3 3 3 3 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
            </boxed>

            <h2>--select / -s <span class="text-caption grey--text text--darken-2">Specify the output fields</span></h2>

            <p>
                By default, the Unipept <initialism>CLI</initialism> commands output all information fields received from the Unipept server. The <inline-code>--select</inline-code> option allows you
                to control which fields are returned. A list of fields can be specified by a comma-separated list, or by using multiple <inline-code>--select</inline-code>
                options. A <b>*</b> can be used as a wildcard for field names. For example, <inline-code>--select peptide,taxon*</inline-code> will return the peptide field and all
                fields starting with taxon.
            </p>

            <h4>Example</h4>
            <boxed>
                <sentinel>$</sentinel> unipept pept2ec <b>--select</b> peptide,ec_number AALTER
                <br>ec_number,peptide
                <br>2.3.2.27 2.7.13.3 6.2.1.3 6.1.1.6 6.3.2.13 2.7.4.25 6.1.1.22 3.1.26.- 2.3.1.29 2.7.1.15,AALTER
                <br><sentinel>$</sentinel> unipept pept2ec <b>--select</b> peptide <b>--select</b> *name AALTER
                <br>ec_number,peptide
                <br>2.3.2.27 2.7.13.3 6.2.1.3 6.1.1.6 6.3.2.13 2.7.4.25 6.1.1.22 3.1.26.- 2.3.1.29 2.7.1.15,AALTER
            </boxed>

            <h2>--format / -f <span class="text-caption grey--text text--darken-2">Specify the output format</span></h2>

            <p>
                By default, the Unipept <initialism>CLI</initialism> commands return their output in csv format. The <inline-code>--format</inline-code> option allows you to select another format.
                Supported formats are csv, json, and xml.
            </p>

            <h4>Example</h4>
            <boxed>
                <sentinel>$</sentinel> unipept pept2ec <b>--format</b> json AALTER MDGTEYIIVK
                <br>[{"ec":[{"ec_number":"2.3.2.27","protein_count":111},{"ec_number":"2.7.13.3","protein_count":11},{"ec_number":"6.2.1.3","protein_count":11},{"ec_number":"6.1.1.6","protein_count":8},{"ec_number":"6.3.2.13","protein_count":8},{"ec_number":"2.7.4.25","protein_count":7},{"ec_number":"6.1.1.22","protein_count":6},{"ec_number":"3.1.26.-","protein_count":4},{"ec_number":"2.3.1.29","protein_count":4},{"ec_number":"2.7.1.15","protein_count":3}],"peptide":"AALTER","total_protein_count":1425},{"peptide":"MDGTEYIIVK","total_protein_count":4}]
                <br><sentinel>$</sentinel> unipept pept2lca <b>--format</b> xml AALTER MDGTEYIIVK
                <br>{{ htmlFragment }}
            </boxed>

            <h2>--all / -a <span class="text-caption grey--text text--darken-2">Request additional information</span></h2>

            <p>
                By default, the Unipept <initialism>CLI</initialism> commands only request basic information from the Unipept server. By using the <inline-code>--all</inline-code> flag, you can request
                additional information fields such as the lineage of the returned taxa. You can use the <inline-code>--select</inline-code> option to select which fields are
                included in the output.
            </p>

            <StaticAlert title="Performance penalty">
                <p>
                    Setting <inline-code>--all</inline-code> has a performance penalty inferred from additional database queries. Do not use this parameter
                    unless the extra information fields are needed.
                </p>
            </StaticAlert>

            <h4>Example</h4>
            <boxed>
                <sentinel>$</sentinel> unipept pept2ec <b>--all</b> --select peptide,ec_number,*name AALTER
                <br>ec_number,ec_name,peptide
                <br>2.3.2.27 2.7.13.3 6.2.1.3 6.1.1.6 6.3.2.13 2.7.4.25 6.1.1.22 3.1.26.- 2.3.1.29 2.7.1.15,"RING-type E3 ubiquitin transferase Histidine kinase Long-chain-fatty-acid--CoA ligase Lysine--tRNA ligase UDP-N-acetylmuramoyl-L-alanyl-D-glutamate--2,6-diaminopimelate ligase (d)CMP kinase Asparagine--tRNA ligase Endoribonucleases producing 5'-phosphomonoesters Glycine C-acetyltransferase Ribokinase",AALTER
            </boxed>

            <h2>--help / -h <span class="text-caption grey--text text--darken-2">Display help</span></h2>

            <p>
                This flag displays the help.
            </p>
        </header-body-card>
    </v-container>
</template>

<script setup lang="ts">
import InlineCode from '@/components/highlights/InlineCode.vue';
import HeaderBodyCard from '@/components/cards/HeaderBodyCard.vue';
import Boxed from '@/components/highlights/Boxed.vue';
import Sentinel from '@/components/highlights/Sentinel.vue';
import RLink from '@/components/highlights/ResourceLink.vue';
import StaticAlert from '@/components/alerts/StaticAlert.vue';
import initialism from '@/components/highlights/Initialism.vue';

const htmlFragment = "<results><result><ec><item><ec_number>2.3.2.27</ec_number><protein_count>111</protein_count></item><item><ec_number>2.7.13.3</ec_number><protein_count>11</protein_count></item><item><ec_number>6.2.1.3</ec_number><protein_count>11</protein_count></item><item><ec_number>6.1.1.6</ec_number><protein_count>8</protein_count></item><item><ec_number>6.3.2.13</ec_number><protein_count>8</protein_count></item><item><ec_number>2.7.4.25</ec_number><protein_count>7</protein_count></item><item><ec_number>6.1.1.22</ec_number><protein_count>6</protein_count></item><item><ec_number>3.1.26.-</ec_number><protein_count>4</protein_count></item><item><ec_number>2.3.1.29</ec_number><protein_count>4</protein_count></item><item><ec_number>2.7.1.15</ec_number><protein_count>3</protein_count></item></ec><peptide>AALTER</peptide><total_protein_count>1425</total_protein_count></result><result><peptide>MDGTEYIIVK</peptide><total_protein_count>4</total_protein_count></result></results>"
</script>
