package storage;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import xml.UniprotDbRef;
import xml.UniprotEntry;

import com.mysql.jdbc.exceptions.jdbc4.MySQLIntegrityConstraintViolationException;

/**
 * Intermediate class to add PeptideData to the database
 * 
 * @author Bart Mesuere
 * 
 */
public class PeptideLoaderData {
	// database stuff
	private Connection connection;

	private PreparedStatement containsSequence;
	private PreparedStatement addSequence;
	private PreparedStatement addUniprotEntry;
	private PreparedStatement addPeptide;
	private PreparedStatement addLineage;
	private PreparedStatement addDbRef;
	private PreparedStatement lineageExists;
	private PreparedStatement getTaxon;

	private Set<Integer> wrongTaxonIds;

	/**
	 * Creates a new data object
	 */
	public PeptideLoaderData() {
		try {
			wrongTaxonIds = new HashSet<Integer>();
			connection = Database.getConnection();
			prepareStatements();
		} catch (SQLException e) {
			System.err.println(new Timestamp(System.currentTimeMillis())
					+ "Database connection failed");
			e.printStackTrace();
			System.exit(1);
		}
	}

	/**
	 * creates all prepared statements used in this class.
	 */
	private void prepareStatements() {
		try {
			containsSequence = connection
					.prepareStatement("SELECT id FROM sequences WHERE `sequence` = ?");
			addSequence = connection.prepareStatement(
					"INSERT INTO sequences (`sequence`) VALUES (?)",
					Statement.RETURN_GENERATED_KEYS);
			addUniprotEntry = connection
					.prepareStatement(
							"INSERT INTO uniprot_entries (`uniprot_accession_number`, `version`, `taxon_id`, `type`) VALUES (?,?,?,?)",
							Statement.RETURN_GENERATED_KEYS);
			addPeptide = connection
					.prepareStatement("INSERT INTO peptides (`sequence_id`, `uniprot_entry_id`, `original_sequence_id`) VALUES (?,?,?)");
			addLineage = connection
					.prepareStatement("INSERT INTO lineages (`taxon_id`) VALUES (?)");
			addDbRef = connection
					.prepareStatement("INSERT INTO uniprot_cross_references (`uniprot_entry_id`, `type`, `protein_id`, `sequence_id`) VALUES (?,?,?,?)");
			lineageExists = connection
					.prepareStatement("SELECT COUNT(*) AS aantal FROM lineages WHERE `taxon_id` = ?");
			getTaxon = connection
					.prepareStatement("SELECT rank, parent_id FROM taxons WHERE id = ?");
		} catch (SQLException e) {
			System.err.println(new Timestamp(System.currentTimeMillis())
					+ " Error creating prepared statements");
			e.printStackTrace();
		}
	}

	/**
	 * Stores a complete UniprotEntry in the database
	 * 
	 * @param entry
	 *            the UniprotEntry to store
	 */
	public void store(UniprotEntry entry) {
		int uniprotEntryId = addUniprotEntry(entry.getUniprotAccessionNumber(), entry.getVersion(),
				entry.getTaxonId(), entry.getType());
		if (uniprotEntryId != -1) { // failed to add entry
			for (String sequence : entry.digest())
				addData(sequence.replace("I", "L"), uniprotEntryId, sequence);
			for (UniprotDbRef ref : entry.getReferences())
				addDbRef(ref, uniprotEntryId);
		}
	}

	/**
	 * 
	 * Inserts the entry info of a uniprot entry into the database and returns
	 * the generated id.
	 * 
	 * @param uniprotAccessionNumber
	 *            The accession number of the entry
	 * @param version
	 *            The version of the entry
	 * @param taxonId
	 *            The taxonId of the organism of the entry
	 * @param type
	 *            The type of the entry. Can be swissprot or trembl
	 * @return The database ID of the uniprot entry.
	 */
	public int addUniprotEntry(String uniprotAccessionNumber, int version, int taxonId, String type) {
		try {
			addUniprotEntry.setString(1, uniprotAccessionNumber);
			addUniprotEntry.setInt(2, version);
			addUniprotEntry.setInt(3, taxonId);
			addUniprotEntry.setString(4, type);
			addUniprotEntry.executeUpdate();
			ResultSet res = addUniprotEntry.getGeneratedKeys();
			res.next();
			int id = res.getInt(1);
			res.close();
			return id;
		} catch (MySQLIntegrityConstraintViolationException e) {
			if (!wrongTaxonIds.contains(taxonId)) {
				wrongTaxonIds.add(taxonId);
				System.err.println(new Timestamp(System.currentTimeMillis()) + " " + taxonId
						+ " added to the list of " + wrongTaxonIds.size() + " invalid taxonIds.");
			}
		} catch (SQLException e) {
			System.err.println(new Timestamp(System.currentTimeMillis())
					+ " Error executing query.");
			e.printStackTrace();
		}
		return -1;
	}

	/**
	 * returns the database ID of given sequence. If the local index is enabled,
	 * try that index first. If no ID is found, the sequence is added to the
	 * database.
	 * 
	 * @param sequence
	 *            String of the sequence of which we want to get the id
	 * @return the database id of given sequence
	 */
	private int getSequenceId(String sequence) {
		try {
			containsSequence.setString(1, sequence);
			ResultSet res = containsSequence.executeQuery();
			if (res.next()) {// try retrieving
				int id = res.getInt("id");
				res.close();
				return id;
			} else {// else add to database
				res.close();
				addSequence.setString(1, sequence);
				addSequence.executeUpdate();
				res = addSequence.getGeneratedKeys();
				res.next();
				int id = res.getInt(1);
				res.close();
				return id;
			}
		} catch (SQLException e) {
			System.err.println(new Timestamp(System.currentTimeMillis())
					+ " Error getting id of sequence " + sequence);
			e.printStackTrace();
		}
		return -1;
	}

	/**
	 * Adds peptide data to the database
	 * 
	 * @param sequence
	 *            The sequence of the peptide
	 * @param uniprotEntryId
	 *            The id of the uniprot entry from which the peptide data was
	 *            retrieved.
	 */
	public void addData(String sequence, int uniprotEntryId, String originalSequence) {
		try {
			addPeptide.setInt(1, getSequenceId(sequence));
			addPeptide.setInt(2, uniprotEntryId);
			addPeptide.setInt(3, getSequenceId(originalSequence));
			addPeptide.executeUpdate();
		} catch (SQLException e) {
			System.err.println(new Timestamp(System.currentTimeMillis())
					+ " Error adding this peptide to the database: " + sequence);
			e.printStackTrace();
		}
	}

	/**
	 * Adds a uniprot entry cross reference to the database
	 * 
	 * @param ref
	 *            The uniprot cross reference to add
	 * @param uniprotEntryId
	 *            The uniprotEntry of the cross reference
	 */
	public void addDbRef(UniprotDbRef ref, int uniprotEntryId) {
		try {
			addDbRef.setInt(1, uniprotEntryId);
			addDbRef.setString(2, ref.getType());
			addDbRef.setString(3, ref.getProteinId());
			addDbRef.setString(4, ref.getSequenceId());
			addDbRef.executeUpdate();
		} catch (SQLException e) {
			System.err.println(new Timestamp(System.currentTimeMillis())
					+ " Error adding this cross reference to the database.");
			e.printStackTrace();
		}

	}

	/**
	 * Returns a List containing all the taxonIds of which the database contains
	 * a peptide
	 * 
	 * @return a list of taxonIds
	 */
	public List<Integer> getUniqueTaxonIds() {
		List<Integer> result = new ArrayList<Integer>();
		Statement stmt;
		try {
			stmt = connection.createStatement();
			try {
				ResultSet rs = stmt.executeQuery("SELECT DISTINCT taxon_id FROM uniprot_entries");
				while (rs.next())
					result.add(rs.getInt(1));
				rs.close();
			} catch (SQLException e) {
				System.err.println(new Timestamp(System.currentTimeMillis())
						+ " Something went wrong truncating tables.");
				e.printStackTrace();
			} finally {
				stmt.close();
			}
		} catch (SQLException e1) {
			System.err.println(new Timestamp(System.currentTimeMillis())
					+ " Something went wrong creating a new statement.");
			e1.printStackTrace();
		}
		return result;
	}

	/**
	 * Adds the complete lineage to the database for the given taxonomic
	 * element.
	 * 
	 * @param taxonId
	 *            The taxonId of the organism
	 */
	public void addLineage(int taxonId) {
		try {
			lineageExists.setInt(1, taxonId);
			ResultSet rs = lineageExists.executeQuery();
			if (rs.next() && rs.getInt("aantal") == 0) {
				addLineage.setInt(1, taxonId);
				addLineage.execute();
				updateLineage(taxonId, taxonId);
			}
			rs.close();
		} catch (SQLException e) {
			System.err.println(new Timestamp(System.currentTimeMillis())
					+ " Something went wrong with the database");
			e.printStackTrace();
		}
	}

	/**
	 * Updates the lineage record of the given taxonId with the information in
	 * the Taxon record of parentId
	 * 
	 * @param taxonId
	 *            The taxonId of the record that needs updating
	 * @param parentId
	 *            The taxonId of the record containing new information
	 * @throws SQLException
	 */
	private void updateLineage(int taxonId, int parentId) throws SQLException {
		// if the parent == 1, we're at the root
		if (parentId != 1) {
			if (taxonId != parentId) {
				addLineage(parentId);
			}
			// retrieve the parent info
			getTaxon.setInt(1, parentId);
			ResultSet rs = getTaxon.executeQuery();
			if (rs.next()) {
				String rank = rs.getString("rank");

				// if we have a valid rank, update the lineage
				if (!rank.equals("no rank")) {
					rank = rank.replace(' ', '_');
					Statement stmt = connection.createStatement();
					stmt.executeUpdate("UPDATE lineages SET `" + rank + "` = " + parentId
							+ " WHERE `taxon_id` = " + taxonId);
					stmt.close();
				}

				// recursion if fun!
				updateLineage(taxonId, rs.getInt("parent_id"));
			}
			rs.close();
		}
	}

	/**
	 * Truncates all peptide tables
	 */
	public void emptyAllTables() {
		Statement stmt;
		try {
			stmt = connection.createStatement();
			try {
				stmt.executeQuery("SET FOREIGN_KEY_CHECKS=0");
				stmt.executeUpdate("TRUNCATE TABLE `peptides`");
				stmt.executeUpdate("TRUNCATE TABLE `sequences`");
				stmt.executeUpdate("TRUNCATE TABLE `uniprot_entries`");
				stmt.executeUpdate("TRUNCATE TABLE `lineages`");
				stmt.executeQuery("SET FOREIGN_KEY_CHECKS=1");
			} catch (SQLException e) {
				System.err.println(new Timestamp(System.currentTimeMillis())
						+ " Something went wrong truncating tables.");
				e.printStackTrace();
			} finally {
				stmt.close();
			}
		} catch (SQLException e1) {
			System.err.println(new Timestamp(System.currentTimeMillis())
					+ " Something went wrong creating a new statement.");
			e1.printStackTrace();
		}
	}

	public void emptyLineages() {
		Statement stmt;
		try {
			stmt = connection.createStatement();
			try {
				stmt.executeUpdate("TRUNCATE TABLE `lineages`");
			} catch (SQLException e) {
				System.err.println(new Timestamp(System.currentTimeMillis())
						+ " Something went wrong truncating tables.");
				e.printStackTrace();
			} finally {
				stmt.close();
			}
		} catch (SQLException e1) {
			System.err.println(new Timestamp(System.currentTimeMillis())
					+ " Something went wrong creating a new statement.");
			e1.printStackTrace();
		}
	}

}
