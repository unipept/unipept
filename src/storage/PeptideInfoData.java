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
@Deprecated
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
					.prepareStatement("SELECT query.sequence_id, query.species_id, taxon_names.name, aantal_genomen_met_voorkomen, aantal_genomen, (aantal_genomen_met_voorkomen/aantal_genomen) AS procentueel FROM (SELECT sequence_id, species_id, COUNT(DISTINCT organism_id) AS aantal_genomen_met_voorkomen FROM unipept.peptides INNER JOIN unipept.organisms ON (organisms.id = peptides.organism_id) INNER JOIN unipept.sequence ON (peptides.sequence_id = sequence.id) WHERE sequence.sequence = ? GROUP BY sequence_id, species_id) AS query INNER JOIN (SELECT species_id, COUNT(*) AS aantal_genomen FROM unipept.organisms GROUP BY species_id) AS aantallen ON (query.species_id = aantallen.species_id) INNER JOIN unipept.taxon_names ON (query.species_id = taxon_names.tax_id)");
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
