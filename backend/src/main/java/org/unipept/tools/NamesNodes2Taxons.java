package org.unipept.tools;

import java.io.IOException;
import java.io.FileNotFoundException;

import org.unipept.taxons.TaxonList;

public class NamesNodes2Taxons {

    /**
     * Parse a list of taxons from the NCBI dumps.
     *
     * This program will parse the first two argument files, and create the
     * third. The first two arguments are the nodes.dmp en names.dmp files
     * downloaded from the NCBI. The third parameter is a filename, which will
     * be overwritten with a tsv-dump of the taxons table.
     */
    public static void main(String[] args) throws IOException {
        if(args.length != 3) {
            throw new RuntimeException("Please provide the parameters.");
        }

        String namesFile = args[0];
        String nodesFile = args[1];
        String taxonsFile = args[2];

        TaxonList tl = TaxonList.parseDumps(namesFile, nodesFile);
        tl.invalidate();
        tl.writeToFile(taxonsFile);
    }

}
