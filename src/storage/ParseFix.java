package storage;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;

public class ParseFix {

	private Connection connection;

	private PreparedStatement rSequences;
	private PreparedStatement kSequences;
	private PreparedStatement containsSequence;
	private PreparedStatement replacePeptide;
	private PreparedStatement updateSequence;
	private PreparedStatement deleteSequence;

	/**
	 * Creates a new data object
	 */
	public ParseFix() {
		try {
			connection = Database.getConnection();
			prepareStatements();
		} catch (SQLException e) {
			System.err.println(new Timestamp(System.currentTimeMillis())
					+ "Database connection failed");
			e.printStackTrace();
			System.exit(1);
		}
		fixSequences(kSequences);
		fixSequences(rSequences);
	}

	/**
	 * creates all prepared statements used in this class.
	 */
	private void prepareStatements() {
		try {
			kSequences = connection
					.prepareStatement("SELECT * FROM sequences WHERE `sequence` LIKE 'K%' LIMIT 1000");
			rSequences = connection
					.prepareStatement("SELECT * FROM sequences WHERE `sequence` LIKE 'R%' LIMIT 1000");
			containsSequence = connection
					.prepareStatement("SELECT id FROM sequences WHERE `sequence` = ?");
			replacePeptide = connection
					.prepareStatement("UPDATE peptides SET `sequence_id` = ?  WHERE `sequence_id` = ?");
			updateSequence = connection
					.prepareStatement("UPDATE sequences SET `sequence` = ?  WHERE `id` = ?");
			deleteSequence = connection.prepareStatement("DELETE FROM sequences WHERE `id` = ?");
		} catch (SQLException e) {
			System.err.println(new Timestamp(System.currentTimeMillis())
					+ " Error creating prepared statements");
			e.printStackTrace();
		}
	}

	public void fixSequences(PreparedStatement ps) {
		try {
			ResultSet res = ps.executeQuery();
			while (res.next()) {// try retrieving
				int id = res.getInt("id");
				String seq = res.getString("sequence").substring(1);
				containsSequence.setString(1, seq);
				ResultSet res2 = containsSequence.executeQuery();
				if (res2.next()) {
					replacePeptide.setInt(1, res2.getInt(1));
					replacePeptide.setInt(2, id);
					replacePeptide.executeUpdate();
					deleteSequence.setInt(1, id);
					deleteSequence.executeUpdate();
				} else {
					updateSequence.setString(1, seq);
					updateSequence.setInt(2, id);
					updateSequence.executeUpdate();
				}
				res2.close();
			}
			res.close();
		} catch (SQLException e) {
			e.printStackTrace();
		}
	}

	/**
	 * @param args
	 */
	public static void main(String[] args) {
		new ParseFix();
	}

}
