package org.unipept.tools;

import java.io.IOException;
import java.io.FileNotFoundException;

import org.unipept.taxons.TaxonList;

public class NamesNodes2TaxonsLineages {

    /**
     * Parse a list of taxons and their lineages from the NCBI dumps.
     *
     * This program will parse the first two argument files, and create the next
     * two. The first two arguments are the nodes.dmp en names.dmp files
     * downloaded from the NCBI. TSV-dumps of the parsed taxons and lineages
     * will be written to the third and fourth parameter.
     */
    public static void main(String[] args) throws IOException {
        if(args.length != 4) {
            throw new RuntimeException("Please provide the parameters.");
        }

        String namesFile = args[0];
        String nodesFile = args[1];
        String taxonsFile = args[2];
        String lineagesFile = args[3];

        TaxonList tl = TaxonList.parseDumps(namesFile, nodesFile);
        tl.invalidate();
        tl.writeToFile(taxonsFile);
        tl.writeLineagesToFile(lineagesFile);
    }

}

