package tools.commandline;

import java.io.BufferedReader;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.sql.Timestamp;
import java.util.Iterator;

import org.biojava.bio.Annotation;
import org.biojava.bio.BioException;
import org.biojava.bio.proteomics.Digest;
import org.biojava.bio.proteomics.Protease;
import org.biojava.bio.proteomics.ProteaseManager;
import org.biojava.bio.seq.DNATools;
import org.biojava.bio.seq.Feature;
import org.biojava.bio.seq.FeatureFilter;
import org.biojava.bio.seq.FeatureHolder;
import org.biojava.bio.seq.Sequence;
import org.biojava.bio.seq.SequenceTools;
import org.biojavax.bio.seq.RichSequence;
import org.biojavax.bio.seq.RichSequenceIterator;

import storage.PeptideLoaderData;

/**
 * This script parses genbank files, extracts the protein information and puts
 * the peptides in the database.
 * 
 * BEFORE ADDING PEPTIDES TO THE DATABASE, ALL TABLES ARE TRANCATED.
 * 
 * The input is expected to be a file containing a list of genbank filenames.
 * 
 * @author Bart Mesuere
 * 
 */
public class PeptideLoader {
	// peptide settings
	private static final int MIN_PEPT_SIZE = 8;
	private static final int MAX_PEPT_SIZE = 50;
	private static final boolean REPLACE_LEUCINE = true;

	// digest settings
	private static final Protease PROTEASE = ProteaseManager.getTrypsin();
	private static final int MAX_MESSED_CLEAVAGES = 0;

	/**
	 * This script parses genbank files, extracts the protein information and
	 * puts the peptides in the database. The input is expected to be a file
	 * containing a list of genbank filenames.
	 * 
	 * @param args
	 *            the path to the input file
	 */
	public static void main(String[] args) {
		// Process input
		if (args.length != 1) {
			System.out.println("Usage: java PeptideLoader input.txt");
			System.exit(-1);
		}

		// easy access to the database
		PeptideLoaderData data = new PeptideLoaderData(true);
		data.emptyAllTables();

		// digest settings
		Digest digest = new Digest();
		digest.setMaxMissedCleavages(MAX_MESSED_CLEAVAGES);
		digest.setProtease(PROTEASE);

		// reader to read input file
		BufferedReader inputReader;
		try {
			inputReader = new BufferedReader(new FileReader(args[0]));

			// read input file line by line
			String input;
			try {
				while ((input = inputReader.readLine()) != null) {
					try {
						System.err.println(new Timestamp(System.currentTimeMillis()) + " Reading "
								+ input);
						// reader to read genbank file
						BufferedReader genbankReader = new BufferedReader(new FileReader(input));

						// loading the genbank file
						RichSequenceIterator rsi = RichSequence.IOTools.readGenbankDNA(
								genbankReader, null);

						// Since a single file can contain more than a sequence,
						// you need to iterate over rsi to get the information.
						while (rsi.hasNext()) {
							RichSequence rs = rsi.nextRichSequence();
							// We only want the CDS features
							FeatureHolder holder = rs.filter(new FeatureFilter.ByType("CDS"));
							Iterator<Feature> featureIterator = holder.features();
							// Process every CDS
							while (featureIterator.hasNext()) {
								// create a Sequence containing the AA sequence
								Sequence aaSequence = SequenceTools.createSequence(
										DNATools.toProtein(featureIterator.next().getSymbols()),
										"", rs.getDescription(), Annotation.EMPTY_ANNOTATION);

								// digesting the sequence
								digest.setSequence(aaSequence);
								digest.addDigestFeatures();

								// process every peptide
								Iterator<Feature> peptideIterator = aaSequence.features();
								Feature f;
								while (peptideIterator.hasNext()) {
									f = peptideIterator.next();
									String seqString = f.getSymbols().seqString();

									// replace Isoleucine by Leucine
									if (REPLACE_LEUCINE)
										seqString = seqString.replace("I", "L");

									// remove trailing *
									if (seqString.endsWith("*"))
										seqString = seqString.substring(0, seqString.length() - 1);

									// add the peptide to the trie
									if (seqString.length() >= MIN_PEPT_SIZE
											&& seqString.length() <= MAX_PEPT_SIZE) {
										data.addData(seqString, rs.getTaxon().getDisplayName(), rs
												.getTaxon().getNCBITaxID(), f.getLocation()
												.getMin());
									}
								}
							}
						}
					} catch (BioException e) {
						System.err.println(new Timestamp(System.currentTimeMillis())
								+ " BioJava is not happy");
						e.printStackTrace();
					}
				}
			} catch (IOException e1) {
				System.err.println(new Timestamp(System.currentTimeMillis())
						+ " There was some problem reading file " + args[0]);
				e1.printStackTrace();
			}

		} catch (FileNotFoundException e2) {
			System.err.println(new Timestamp(System.currentTimeMillis()) + " The file " + args[0]
					+ " could not be found");
			e2.printStackTrace();
		}
	}
}
