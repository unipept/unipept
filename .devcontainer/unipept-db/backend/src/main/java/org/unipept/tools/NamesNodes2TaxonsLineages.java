package org.unipept.tools;

import java.io.IOException;
import java.io.FileNotFoundException;

import com.beust.jcommander.Parameter;
import com.beust.jcommander.JCommander;

import org.unipept.taxons.TaxonList;

public class NamesNodes2TaxonsLineages {

    @Parameter(names="--names", description="Taxon names input file") public String namesFile;
    @Parameter(names="--nodes", description="Taxon nodes input file") public String nodesFile;
    @Parameter(names="--taxons", description="Taxon TSV output file") public String taxonsFile;
    @Parameter(names="--lineages", description="Lineages TSV output file") public String lineagesFile;

    /**
     * Parse a list of taxons and their lineages from the NCBI dumps.
     *
     * This program will parse the first two argument files, and create the next
     * two. The first two arguments are the nodes.dmp en names.dmp files
     * downloaded from the NCBI. TSV-dumps of the parsed taxons and lineages
     * will be written to the third and fourth parameter.
     */
    public static void main(String[] args) throws IOException {
        NamesNodes2TaxonsLineages main = new NamesNodes2TaxonsLineages();
        new JCommander(main, args);

        TaxonList tl = TaxonList.parseDumps(main.namesFile, main.nodesFile);
        tl.invalidate();
        tl.writeToFile(main.taxonsFile);
        tl.writeLineagesToFile(main.lineagesFile);
    }

}

