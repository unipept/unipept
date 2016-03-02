package org.unipept.tools;

import java.io.IOException;
import java.io.FileNotFoundException;

import com.beust.jcommander.Parameter;
import com.beust.jcommander.JCommander;

import org.unipept.taxons.TaxonList;

public class NamesNodes2Taxons {

    @Parameter(names="--names", description="Taxon names input file") public String namesFile;
    @Parameter(names="--nodes", description="Taxon nodes input file") public String nodesFile;
    @Parameter(names="--taxons", description="Taxon TSV output file") public String taxonsFile;

    /**
     * Parse a list of taxons from the NCBI dumps.
     *
     * This program will parse the first two argument files, and create the
     * third. The first two arguments are the nodes.dmp en names.dmp files
     * downloaded from the NCBI. The third parameter is a filename, which will
     * be overwritten with a tsv-dump of the taxons table.
     */
    public static void main(String[] args) throws IOException {
        NamesNodes2Taxons main = new NamesNodes2Taxons();
        new JCommander(main, args);

        TaxonList tl = TaxonList.parseDumps(main.namesFile, main.nodesFile);
        tl.invalidate();
        tl.writeToFile(main.taxonsFile);
    }

}
