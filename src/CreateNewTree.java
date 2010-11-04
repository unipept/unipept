import java.io.BufferedReader;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.IOException;
import java.io.ObjectOutputStream;
import java.io.PrintStream;
import java.sql.Timestamp;
import java.util.Iterator;
import java.util.Set;

import org.ardverk.collection.PatriciaTrie;
import org.ardverk.collection.StringKeyAnalyzer;
import org.ardverk.collection.Trie;
import org.biojava.bio.Annotation;
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

public class CreateNewTree {
	// peptide settings
	private static final int MIN_PEPT_SIZE = 8;
	private static final int MAX_PEPT_SIZE = 50;
	private static final boolean REPLACE_LEUCINE = true;

	// digest settings
	private static final Protease PROTEASE = ProteaseManager.getTrypsin();
	private static final int MAX_MESSED_CLEAVAGES = 0;

	/**
	 * 
	 * @param args
	 */
	public static void main(String[] args) {
		// Process input
		if (args.length != 2) {
			System.out.println("Usage: java CreateNewTree input.txt output.dat");
			System.exit(-1);
		}

		// stats
		try {
			System.setOut(new PrintStream(args[1] + ".stats"));
			System.setErr(new PrintStream(args[1] + ".err"));
		} catch (FileNotFoundException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		// Trie data structure
		PatriciaTrie<String, String> trie = new PatriciaTrie<String, String>(
				StringKeyAnalyzer.INSTANCE);

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
						// you
						// need to iterate over rsi to get the information.
						while (rsi.hasNext()) {
							RichSequence rs = rsi.nextRichSequence();

							// We only want the CDS features
							FeatureHolder holder = rs.filter(new FeatureFilter.ByType("CDS"));
							Iterator<Feature> featureIterator = holder.features();
							int numProts = 0;
							int totalNumPepts = 0;
							int filteredNumPepts = 0;
							int totalPeptLength = 0;
							int filteredPeptLength = 0;
							// Process every CDS
							while (featureIterator.hasNext()) {
								numProts++;
								// create a Sequence containing the AA sequence
								Sequence aaSequence = SequenceTools.createSequence(
										DNATools.toProtein(featureIterator.next().getSymbols()),
										"", rs.getDescription(), Annotation.EMPTY_ANNOTATION);

								// digesting the sequence
								digest.setSequence(aaSequence);
								digest.addDigestFeatures();

								// process every peptide
								Iterator<Feature> peptideIterator = aaSequence.features();
								while (peptideIterator.hasNext()) {
									String seqString = peptideIterator.next().getSymbols()
											.seqString();

									// replace Isoleucine by Leucine
									if (REPLACE_LEUCINE)
										seqString = seqString.replace("I", "L");

									// remove trailing *
									if (seqString.endsWith("*"))
										seqString = seqString.substring(0, seqString.length() - 1);

									totalNumPepts++;
									totalPeptLength += seqString.length();

									// add the peptide to the trie
									if (seqString.length() >= MIN_PEPT_SIZE
											&& seqString.length() <= MAX_PEPT_SIZE) {
										trie.put(seqString, rs.getDescription());
										filteredNumPepts++;
										filteredPeptLength += seqString.length();
									}
								}
							}
							System.out.println(rs.getTaxon().getDisplayName() + "\t" + rs.getName()
									+ "\t" + rs.getDescription() + "\t" + numProts + "\t"
									+ totalNumPepts + "\t" + filteredNumPepts + "\t"
									+ (totalPeptLength / totalNumPepts) + "\t"
									+ (filteredPeptLength / filteredNumPepts));
						}
					} catch (Exception e) {
						e.printStackTrace();
					}
				}
			} catch (IOException e1) {
				// TODO Auto-generated catch block
				e1.printStackTrace();
			}
			// let's write the trie to a file
			ObjectOutputStream outputStream;
			try {
				outputStream = new ObjectOutputStream(new FileOutputStream(args[1] + ".trie"));
				outputStream.writeObject(trie);
				outputStream.flush();
			} catch (FileNotFoundException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}

			// the quest for unique peptides begins
			searchUniquePeptides(trie);

		} catch (FileNotFoundException e2) {
			// TODO Auto-generated catch block
			e2.printStackTrace();
		}
	}

	public static void searchUniquePeptides(Trie<String, String> trie) {
		Set<String> keyset = trie.keySet();
		for (String key : keyset) {
			// trie.
		}
	}
}
