package org.unipept.storage;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
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
	public void invalidate(String whereClause, boolean withChildren) {
		Statement stmt;
		try {
			stmt = connection.createStatement();
			try {
				if (withChildren) {// if we have to invalidate the children
					ResultSet rs = stmt.executeQuery("SELECT COUNT(*) FROM taxons WHERE "
							+ whereClause);
					rs.next();
					if (rs.getInt(1) > 0)// if there are any children
						invalidate(
								"parent_id IN (SELECT id FROM taxons WHERE " + whereClause + ")",
								true);
					rs.close();
				}
				if (whereClause.contains("WHERE")) {
					System.out.println("SELECT id FROM taxons WHERE " + whereClause);
					ResultSet rs = stmt.executeQuery("SELECT id FROM taxons WHERE " + whereClause);
					String ids = "";
					while (rs.next())
						ids += rs.getString(1) + ", ";
					rs.close();
					if (ids.length() > 0) {
						ids = ids.substring(0, ids.length() - 2);

						stmt.executeUpdate("UPDATE taxons SET `valid_taxon` = 0 WHERE id IN ("
								+ ids + ")");
					}
				} else {
					System.out.println("UPDATE taxons SET `valid_taxon` = 0 WHERE " + whereClause);
					stmt.executeUpdate("UPDATE taxons SET `valid_taxon` = 0 WHERE " + whereClause);
				}
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
