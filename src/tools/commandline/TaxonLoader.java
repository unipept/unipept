package tools.commandline;

import java.io.BufferedReader;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.sql.Timestamp;

import storage.TaxonLoaderData;

/**
 * This script parses NCBI taxon node and name files and inserts them into the
 * database.
 * 
 * BEFORE ADDING DATA TO THE DATABASE, ALL TABLES ARE TRANCATED.
 * 
 * The input is expected to be the NCBI names.dmp and nodes.dmp.
 * 
 * @author Bart Mesuere
 * 
 */
public class TaxonLoader {
	// data
	TaxonLoaderData data;

	// BioJava
	private final String nodes;
	private final String names;

	/**
	 * creates a new instance of TaxonLoader and cleans the old database
	 * 
	 * @param nodes
	 *            The path to the nodes.dmp file
	 * @param names
	 *            The path to the names.dmp file
	 */
	public TaxonLoader(String nodes, String names) {
		data = new TaxonLoaderData();
		data.emptyAllTables();
		this.nodes = nodes;
		this.names = names;
	}

	/**
	 * Starts parsing the dumps
	 */
	private void startLoading() {
		try {
			// parse the nodes file
			BufferedReader reader = new BufferedReader(new FileReader(nodes));
			String line;
			while ((line = reader.readLine()) != null) {
				String[] parts = line.split("\\|");
				Integer taxId = Integer.valueOf(parts[0].trim());
				String pti = parts[1].trim();
				Integer parentTaxId = pti.length() > 0 ? new Integer(pti) : null;
				String rank = parts[2].trim();
				Integer geneticCode = new Integer(parts[6].trim());
				Integer mitoCode = new Integer(parts[8].trim());
				Boolean isTaxonHidden = Boolean.valueOf(parts[10].trim());
				data.addNode(taxId, parentTaxId, rank, geneticCode, mitoCode, isTaxonHidden);
			}

			// parse the names file
			reader = new BufferedReader(new FileReader(names));
			while ((line = reader.readLine()) != null) {
				String[] parts = line.split("\\|");
				Integer taxId = Integer.valueOf(parts[0].trim());
				String name = parts[1].trim();
				String nameClass = parts[3].trim();
				if (nameClass.equals("Scientific name"))
					data.addName(taxId, name);
			}

		} catch (FileNotFoundException e) {
			System.err.println(new Timestamp(System.currentTimeMillis())
					+ " A file could not be found, check your input");
			e.printStackTrace();
		} catch (IOException e) {
			System.err.println(new Timestamp(System.currentTimeMillis())
					+ " There was some problem reading a file.");
			e.printStackTrace();
		}
	}

	/**
	 * This script parses NCBI taxon node and name files and inserts them into
	 * the database.
	 * 
	 * The input is expected to be the NCBI names.dmp and nodes.dmp.
	 * 
	 * @param args
	 *            the path to the input file
	 */
	public static void main(String[] args) {
		// Process input
		if (args.length != 2) {
			System.out.println("Usage: java TaxonLoader nodes.dmp names.dmp");
			System.exit(-1);
		}
		TaxonLoader tl = new TaxonLoader(args[0], args[1]);
		tl.startLoading();
	}
}
