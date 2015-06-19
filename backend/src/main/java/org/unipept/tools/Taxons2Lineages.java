package org.unipept.taxons;

import java.io.IOException;

import org.unipept.taxons.TaxonList;

public class Taxons2Lineages {

    public static void main(String[] args) throws IOException {
        if(args.length != 2) {
            throw new RuntimeException("Please provide the parameters.");
        }

        String taxonsFile = args[0];
        String lineagesFile = args[1];

        TaxonList tl = TaxonList.loadFromFile(taxonsFile);
        tl.writeLineagesToFile(lineagesFile);
    }

}
