package tools.commandline;

import java.sql.Timestamp;

import storage.TaxonInvalidatorData;

/**
 * This script invalidates NCBI taxon data
 * 
 * @author Bart Mesuere
 * 
 */
public class TaxonInvalidator {
	// data
	TaxonInvalidatorData data;

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
		// bad names
		data.invalidate("name like \"uncultured%\"", true);
		data.invalidate("name like \"%unidentified%\"", true);
		data.invalidate("name like \"%unclassified%\"", true);
		data.invalidate("name like \"%unspecified%\"", true);

		// "other sequences" & "environmental samples"
		data.invalidate("id=28384", true);
		data.invalidate("id=48479", true);

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
	public static void main(String[] args) {
		TaxonInvalidator ti = new TaxonInvalidator();
		ti.invalidate();
	}
}
