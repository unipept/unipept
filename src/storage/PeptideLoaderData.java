package storage;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

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
	private PreparedStatement addGenbankFile;
	private PreparedStatement addPeptide;
	private PreparedStatement addLineage;
	private PreparedStatement lineageExists;
	private PreparedStatement getTaxon;

	/**
	 * Creates a new data object
	 */
	public PeptideLoaderData() {
		try {
			connection = Database.getConnection();
			prepareStatements();
		} catch (SQLException e) {
			System.err.println(new Timestamp(System.currentTimeMillis())
					+ "Database connection failed");
			e.printStackTrace();
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
			addGenbankFile = connection
					.prepareStatement(
							"INSERT INTO genbank_files (`project_id`, `accession_number`, `draft`, `taxon_id`, `hash`) VALUES (?,?,?,?,?)",
							Statement.RETURN_GENERATED_KEYS);
			addPeptide = connection
					.prepareStatement("INSERT INTO peptides (`sequence_id`, `genbank_file_id`) VALUES (?,?)");
			addLineage = connection
					.prepareStatement("INSERT INTO lineages (`taxon_id`) VALUES (?)");
			lineageExists = connection
					.prepareStatement("SELECT COUNT(*) AS aantal FROM lineages WHERE `taxon_id` = ?");
			getTaxon = connection
					.prepareStatement("SELECT rank, parent_id FROM taxons WHERE id = ?");
		} catch (SQLException e) {
			System.err.println(new Timestamp(System.currentTimeMillis())
					+ "Error creating prepared statements");
			e.printStackTrace();
		}
	}

	/**
	 * 
	 * Inserts the file info of a Genbank file into the database and returns the
	 * generated id.
	 * 
	 * @param projectId
	 *            The project ID stored in the file
	 * @param accessionNumber
	 *            The accession number stored in the file
	 * @param draft
	 *            Is this a draft genome?
	 * @param taxonId
	 *            The taxonId of the organism of which the genome is contained
	 *            within the file
	 * @param hash
	 *            The MD5 hash of the Genbank file. This is used to know if the
	 *            file is updated.
	 * @return The database ID of the Genbank file.
	 */
	public int addGenbankFile(String projectId, String accessionNumber, boolean draft, int taxonId,
			String hash) {
		try {
			addGenbankFile.setString(1, projectId);
			addGenbankFile.setString(2, accessionNumber);
			addGenbankFile.setBoolean(3, draft);
			addGenbankFile.setInt(4, taxonId);
			addGenbankFile.setString(5, hash);
			addGenbankFile.executeUpdate();
			ResultSet res = addGenbankFile.getGeneratedKeys();
			res.next();
			int id = res.getInt(1);
			res.close();
			return id;
		} catch (SQLException e) {
			System.err.println(new Timestamp(System.currentTimeMillis()) + "Error executing query");
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
					+ "Error getting id of sequence " + sequence);
			e.printStackTrace();
		}
		return -1;
	}

	/**
	 * Adds peptide data to the database
	 * 
	 * @param sequence
	 *            The sequence of the peptide
	 * @param genbankFileId
	 *            The id of the Genbank file from which the peptide data was
	 *            retrieved.
	 */
	public void addData(String sequence, int genbankFileId) {
		try {
			addPeptide.setInt(1, getSequenceId(sequence));
			addPeptide.setInt(2, genbankFileId);
			addPeptide.executeUpdate();
		} catch (SQLException e) {
			System.err.println(new Timestamp(System.currentTimeMillis())
					+ "Error adding this peptide to the database: " + sequence);
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
				ResultSet rs = stmt.executeQuery("SELECT DISTINCT taxon_id FROM genbank_files");
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
				}

				// recursion if fun!
				updateLineage(taxonId, rs.getInt("parent_id"));
			}
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
				stmt.executeUpdate("TRUNCATE TABLE `peptides`");
				stmt.executeUpdate("TRUNCATE TABLE `sequences`");
				stmt.executeUpdate("TRUNCATE TABLE `genbank_files`");
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
