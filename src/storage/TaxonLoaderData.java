package storage;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;

/**
 * Intermediate class to add Taxondata to the database
 * 
 * @author Bart Mesuere
 * 
 */
public class TaxonLoaderData {
	// database stuff
	private Connection connection;
	private PreparedStatement addNode;
	private PreparedStatement addName;

	/**
	 * Creates a new TaxonData object and gets a database connection
	 */
	public TaxonLoaderData() {
		try {
			connection = Database.getConnection();
			prepareStatements();
		} catch (SQLException e) {
			System.err.println("Database connection failed");
			e.printStackTrace(System.err);
		}
	}

	/**
	 * creates all prepared statements used in this class.
	 */
	private void prepareStatements() {
		try {
			addNode = connection
					.prepareStatement("INSERT INTO taxon_nodes (tax_id, parentTax_id, rank, geneticCode, mitoCode, isTaxonHidden) VALUES (?,?,?,?,?,?)");
			addName = connection
					.prepareStatement("INSERT INTO taxon_names (tax_id, name) VALUES (?,?)");
		} catch (SQLException e) {
			System.err.println("Error creating prepared statements");
			e.printStackTrace();
		}
	}

	/**
	 * Adds a node to the database
	 * 
	 * @param taxId
	 *            The taxonId
	 * @param parentTaxId
	 *            The taxonId of the parent
	 * @param rank
	 *            The taxon rank
	 * @param geneticCode
	 *            no idea
	 * @param mitoCode
	 *            no idea
	 * @param isTaxonHidden
	 *            no idea
	 */
	public void addNode(Integer taxId, Integer parentTaxId, String rank, Integer geneticCode,
			Integer mitoCode, Boolean isTaxonHidden) {
		try {
			addNode.setInt(1, taxId);
			addNode.setInt(2, parentTaxId);
			addNode.setString(3, rank);
			addNode.setInt(4, geneticCode);
			addNode.setInt(5, mitoCode);
			addNode.setBoolean(6, isTaxonHidden);
			addNode.executeUpdate();
		} catch (SQLException e) {
			System.err.println("Error executing query");
			e.printStackTrace(System.err);
		}

	}

	/**
	 * Adds a name to the database
	 * 
	 * @param taxId
	 *            The taxon id
	 * @param name
	 *            The name of the organism
	 * @param nameClass
	 *            the type of name (e.g. synonym)
	 */
	public void addName(Integer taxId, String name) {
		try {
			addName.setInt(1, taxId);
			addName.setString(2, name);
			addName.executeUpdate();
		} catch (SQLException e) {
			System.err.println("Error executing query");
			e.printStackTrace(System.err);
		}

	}

	/**
	 * Truncates all taxon_ tables
	 */
	public void emptyAllTables() {
		Statement stmt;
		try {
			stmt = connection.createStatement();
			try {
				stmt.executeUpdate("TRUNCATE TABLE `taxon_nodes`");
				stmt.executeUpdate("TRUNCATE TABLE `taxon_names`");
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
