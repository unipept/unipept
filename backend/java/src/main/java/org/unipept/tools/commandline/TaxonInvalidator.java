package org.unipept.tools.commandline;

import java.sql.Timestamp;

import org.unipept.storage.TaxonInvalidatorData;

/**
 * This script invalidates NCBI taxon data
 *
 * @author Bart Mesuere
 *
 */
public class TaxonInvalidator {
    // data
    private final TaxonInvalidatorData data;

    /**
     * Creates a new taxon invalidator and sets all taxa to valid
     */
    public TaxonInvalidator() {
        data = new TaxonInvalidatorData();
        System.out.println(new Timestamp(System.currentTimeMillis())
                + " Setting everything to valid...");
        data.setAllValid();
    }

    /**
     * Invalidates invalid taxa.
     */
    public void invalidate() {
        System.out.println(new Timestamp(System.currentTimeMillis()) + " Invalidating...");

        // "other sequences" & "environmental samples"
        data.invalidate("id=28384", true);
        data.invalidate("id=48479", true);

        data.invalidate("name LIKE \"%metagenome\"", true);
        data.invalidate("name LIKE \"%enrichment culture%\"", true);
        data.invalidate("name LIKE \"%mixed culture%\"", true);
        data.invalidate("name LIKE \"%library\"", true);

        // bad names
        data.invalidate("name LIKE \"%uncultured%\" AND valid_taxon = 1", true);
        data.invalidate("name LIKE \"%unidentified%\" AND valid_taxon = 1", true);
        // data.invalidate("name LIKE \"%unclassified%\" AND valid_taxon = 1",
        // false);
        data.invalidate("name LIKE \"%unspecified%\" AND valid_taxon = 1", true);
        data.invalidate("name LIKE \"%undetermined%\" AND valid_taxon = 1", true);
        data.invalidate("name LIKE \"%sample%\" AND valid_taxon = 1", true);

        // elimination of the strain species
        data.invalidate("name LIKE \"% sp.\" AND rank = \"species\" AND valid_taxon = 1", true);
        data.invalidate("name LIKE \"% genomosp.\" AND rank = \"species\" AND valid_taxon = 1",
                true);
        data.invalidate("name RLIKE \"[0-9]\" AND rank = \"species\" AND valid_taxon = 1", true);

        // data.invalidate("rank = \"species\" AND name LIKE \"% % %\" AND name NOT LIKE \"Candidatus %\"");
        // data.invalidate(
        // "rank = \"genus\" AND name LIKE \"% %\" AND name NOT LIKE \"Candidatus %\"",
        // false);
    }

    /**
     * This script invalidates NCBI taxon data
     *
     * @param args
     *            not used
     */
    public static void main(String... args) {
        TaxonInvalidator ti = new TaxonInvalidator();
        ti.invalidate();
    }
}
