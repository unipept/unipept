package org.unipept.storage;

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
	private PreparedStatement addName;
	private PreparedStatement addRank;

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
			addName = connection.prepareStatement("INSERT INTO taxons (id, name) VALUES (?,?)");
			addRank = connection
					.prepareStatement("UPDATE taxons SET rank = ?, parent_id = ? WHERE id = ?");

		} catch (SQLException e) {
			System.err.println("Error creating prepared statements");
			e.printStackTrace();
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
	 * Adds rank information to a taxon database entry
	 * 
	 * @param id
	 *            The id of the entry to which we want to add rank information
	 * @param parentId
	 *            The taxonId of the parent
	 * @param rank
	 *            The taxon rank
	 */
	public void addRank(int id, int parentId, String rank) {
		try {
			addRank.setString(1, rank);
			addRank.setInt(2, parentId);
			addRank.setInt(3, id);
			addRank.executeUpdate();
		} catch (SQLException e) {
			System.err.println("Error executing query");
			e.printStackTrace(System.err);
		}

	}

	/**
	 * Truncates the taxons table
	 */
	public void emptyTaxonTables() {
		Statement stmt;
		try {
			stmt = connection.createStatement();
			try {
				stmt.executeQuery("SET FOREIGN_KEY_CHECKS=0");
				stmt.executeUpdate("TRUNCATE TABLE `taxons`");
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

	/**
	 * Empties the LCA cache
	 */
	public void emptyLCACache() {
		Statement stmt;
		try {
			stmt = connection.createStatement();
			try {
				stmt.executeUpdate("UPDATE `sequences` SET lca_il=NULL, lca=NULL");
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
