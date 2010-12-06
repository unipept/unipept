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
import org.biojavax.RichObjectFactory;
import org.biojavax.bio.seq.RichSequence;
import org.biojavax.bio.seq.RichSequenceIterator;

import storage.PeptideLoaderData;
import biojava.WeakRichObjectBuilder;

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

	// Objects used
	BufferedReader inputReader;
	PeptideLoaderData data;

	// mem leak fix
	WeakRichObjectBuilder wrob = new WeakRichObjectBuilder();

	public PeptideLoader(String datafile) {
		// easy access to the database
		data = new PeptideLoaderData(false);
		// data.emptyAllTables();
		try {
			inputReader = new BufferedReader(new FileReader(datafile));
		} catch (FileNotFoundException e2) {
			System.err.println(new Timestamp(System.currentTimeMillis()) + " The file " + datafile
					+ " could not be found");
			e2.printStackTrace();
		}
		RichObjectFactory.setLRUCacheSize(3);// cache problem?
		RichObjectFactory.setRichObjectBuilder(wrob);
	}

	/**
	 * reads the input file line by line
	 */
	public void processData() {
		String input = "";
		try {
			while ((input = inputReader.readLine()) != null) {
				processFile(input);
			}
		} catch (IOException e1) {
			System.err.println(new Timestamp(System.currentTimeMillis())
					+ " There was some problem reading file " + input);
			e1.printStackTrace();
		}
	}

	/**
	 * Processes a given genbank file.
	 * 
	 * @param file
	 *            a genbank file
	 */
	private void processFile(String file) {
		System.err.println(new Timestamp(System.currentTimeMillis()) + " Reading " + file);

		// digest settings
		Digest digest = new Digest();
		digest.setMaxMissedCleavages(MAX_MESSED_CLEAVAGES);
		digest.setProtease(PROTEASE);

		try {
			// reader to read genbank file
			BufferedReader genbankReader = new BufferedReader(new FileReader(file));
			try {
				// loading the genbank file
				RichSequenceIterator rsi = RichSequence.IOTools.readGenbankDNA(genbankReader, null);

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
								DNATools.toProtein(featureIterator.next().getSymbols()), "",
								rs.getDescription(), Annotation.EMPTY_ANNOTATION);

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
										.getTaxon().getNCBITaxID(), f.getLocation().getMin());
							}

						}
					}
				}
			} catch (BioException e) {
				System.err.println(new Timestamp(System.currentTimeMillis())
						+ " BioJava is not happy");
				e.printStackTrace();
			} finally {
				try {
					genbankReader.close();
				} catch (IOException e) {
					System.err.println(new Timestamp(System.currentTimeMillis())
							+ " Closing the genbank file went wrong.");
					e.printStackTrace();
				}
			}
		} catch (FileNotFoundException e) {
			System.err.println(new Timestamp(System.currentTimeMillis()) + " The file " + file
					+ " could not be found");
			e.printStackTrace();
		}
	}

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

		// create a new loader object
		PeptideLoader loader = new PeptideLoader(args[0]);

		// process input files line by line
		loader.processData();
	}
}
