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
		// data.invalidate("name LIKE \"% % %\" and rank = \"species\"");
		data.invalidate("name like \"uncultured%\"");
		data.invalidate("name like \"%sp.%\"");
		data.invalidate("rank = \"genus\" and name LIKE \"% %\" and name NOT LIKE \"Candidatus %\"");
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
