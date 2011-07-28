package tools.commandline;

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
		data.setAllValid();
	}

	/**
	 * This script invalidates NCBI taxon data
	 * 
	 * @param args
	 *            not used
	 */
	public static void main(String[] args) {
		TaxonInvalidator ti = new TaxonInvalidator();
	}
}
