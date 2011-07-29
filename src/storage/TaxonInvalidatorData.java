package storage;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;

/**
 * Intermediate class to invalidate Taxondata
 * 
 * @author Bart Mesuere
 * 
 */
public class TaxonInvalidatorData {
	// database stuff
	private Connection connection;
	private PreparedStatement setAllValid;

	/**
	 * Creates a new TaxonInvalidatorData object and gets a database connection
	 */
	public TaxonInvalidatorData() {
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
			setAllValid = connection
					.prepareStatement("UPDATE taxons SET valid_taxon = 1 WHERE id > -1");

		} catch (SQLException e) {
			System.err.println("Error creating prepared statements");
			e.printStackTrace();
		}
	}

	/**
	 * Sets all taxa on valid
	 */
	public void setAllValid() {
		try {
			setAllValid.executeUpdate();
		} catch (SQLException e) {
			System.err.println("Error executing query");
			e.printStackTrace(System.err);
		}
	}

	/**
	 * Executes the given query to invalidate taxa
	 * 
	 * @param whereClause
	 *            The where clause that gets appended to
	 *            "UPDATE taxons SET `valid` = 0 WHERE "
	 */
	public void invalidate(String whereClause) {
		Statement stmt;
		try {
			stmt = connection.createStatement();
			try {
				stmt.executeUpdate("UPDATE taxons SET `valid_taxon` = 0 WHERE " + whereClause);
			} catch (SQLException e) {
				System.err.println(new Timestamp(System.currentTimeMillis())
						+ " Something went wrong invalidating taxa.");
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
