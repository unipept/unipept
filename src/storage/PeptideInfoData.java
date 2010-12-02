package storage;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.ArrayList;

/**
 * Intermediate class to retrieve peptide data from the database
 * 
 * @author Bart Mesuere
 * 
 */
public class PeptideInfoData {
	// database stuff
	private Connection connection;

	private PreparedStatement getPeptideInfo;

	/**
	 * Creates a new data object
	 * 
	 */
	public PeptideInfoData() {
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
			getPeptideInfo = connection
					.prepareStatement("SELECT query.sequenceId, query.speciesId, taxon_name.name, aantal_genomen_met_voorkomen, aantal_genomen, (aantal_genomen_met_voorkomen/aantal_genomen) AS procentueel FROM (SELECT sequenceId, speciesId, COUNT(DISTINCT organismId) AS aantal_genomen_met_voorkomen  FROM unipept.peptide  INNER JOIN unipept.organism ON (organism.id = peptide.organismId) INNER JOIN unipept.sequence ON (peptide.sequenceId = sequence.id) WHERE sequence.sequence = ? GROUP BY sequenceId, speciesId) AS query INNER JOIN (SELECT speciesId, COUNT(*) AS aantal_genomen FROM unipept.organism GROUP BY speciesId) AS aantallen ON (query.speciesId = aantallen.speciesId) INNER JOIN unipept.taxon_name ON (query.speciesId = taxon_name.taxId) WHERE taxon_name.nameClass='scientific name'");
		} catch (SQLException e) {
			System.err.println(new Timestamp(System.currentTimeMillis())
					+ "Error creating prepared statements");
			e.printStackTrace();
		}
	}

	public ArrayList<String[]> getPeptideInfo(String peptide) {
		ArrayList<String[]> lijst = new ArrayList<String[]>();
		try {
			getPeptideInfo.setString(1, peptide);
			ResultSet res = getPeptideInfo.executeQuery();
			while (res.next()) {
				String[] rij = new String[4];// TODO: magic number
				rij[0] = res.getString(3);
				rij[1] = res.getString(4);
				rij[2] = res.getString(5);
				rij[3] = res.getString(6);
				lijst.add(rij);
			}
			res.close();
		} catch (SQLException e) {
			System.err.println(new Timestamp(System.currentTimeMillis())
					+ "Error getting info about peptide " + peptide);
			e.printStackTrace();
		}
		return lijst;
	}
}
