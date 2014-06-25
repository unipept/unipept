package org.unipept.storage;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

/**
 * Internal (package private) Database class. Sets up the connection.
 * 
 * @author Bart Mesuere
 * 
 */
class Database {
	// DB settings
	private final static String DRIVER = "com.mysql.jdbc.Driver";

	private final static String JDBC_URL = "jdbc:mysql://localhost/unipept";
	private final static String USER = "unipept";
	private final static String PASSWORD = "unipept";

	/**
	 * Creates a new Connection object with the hardcoded URL, username and
	 * password.
	 * 
	 * TODO: make this a singleton
	 * 
	 * @throws SQLException
	 */
	public static Connection getConnection() throws SQLException {
		return DriverManager.getConnection(JDBC_URL, USER, PASSWORD);
	}

	// load the driver
	static {
		try {
			Class.forName(DRIVER);
		} catch (ClassNotFoundException e) {
			System.err.println("Driver not found");
			e.printStackTrace(System.err);
		}
	}

}
