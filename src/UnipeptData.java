import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.Map;

import org.ardverk.collection.PatriciaTrie;
import org.ardverk.collection.StringKeyAnalyzer;

public class UnipeptData {
	// database stuff
	private Connection connection;

	private PreparedStatement containsSequence;
	private PreparedStatement addSequence;
	private PreparedStatement containsOrganism;
	private PreparedStatement addOrganism;
	private PreparedStatement addPeptide;
	private PreparedStatement getParent;

	// simple cache gives 30% performance increase
	private String organismCacheString = "";
	private int organismCacheInt;

	// use local key index
	private final boolean localSequenceIndex;
	private Map<String, Integer> index;

	public UnipeptData() {
		this(false);
	}

	public UnipeptData(boolean useLocalSequenceIndex) {
		localSequenceIndex = useLocalSequenceIndex;
		try {
			connection = Database.getConnection();
			prepareStatements();
		} catch (SQLException e) {
			System.err.println("Database connection failed");
			e.printStackTrace(System.err);
		}
		if (localSequenceIndex)
			initTrie();
	}

	private void initTrie() {
		index = new PatriciaTrie<String, Integer>(StringKeyAnalyzer.INSTANCE);
		// index = new HashMap<String, Integer>();
	}

	private void prepareStatements() {
		try {
			containsSequence = connection
					.prepareStatement("SELECT id FROM sequence WHERE `sequence` = ?");
			addSequence = connection
					.prepareStatement("INSERT INTO sequence (`sequence`) VALUES (?)",
							Statement.RETURN_GENERATED_KEYS);
			containsOrganism = connection
					.prepareStatement("SELECT id FROM organism WHERE `name` = ?");
			addOrganism = connection
					.prepareStatement(
							"INSERT INTO organism (`name`, `taxonId`, `speciesId`, `genusId`) VALUES (?,?,?,?)",
							Statement.RETURN_GENERATED_KEYS);
			addPeptide = connection
					.prepareStatement("INSERT INTO peptide (`sequenceId`, `organismId`, `position`) VALUES (?,?,?)");
			getParent = connection
					.prepareStatement("SELECT `parentTaxId`, `rank` FROM taxon_node WHERE `taxId` = ?");
		} catch (SQLException e) {
			System.err.println("Error creating prepared statements");
			e.printStackTrace();
		}
	}

	private int getOrganismId(String name, int ncbiTaxonId) {
		if (organismCacheString.equals(name))
			return organismCacheInt;
		try {
			organismCacheString = name;
			containsOrganism.setString(1, name);
			ResultSet res = containsOrganism.executeQuery();
			if (res.next()) {// return id
				organismCacheInt = res.getInt("id");
				res.close();
				return organismCacheInt;
			} else {// first add sequence
				res.close();
				addOrganism.setString(1, name);
				addOrganism.setInt(2, ncbiTaxonId);
				addOrganism.setInt(3, getSpeciesId(ncbiTaxonId));
				addOrganism.setInt(4, getGenusId(ncbiTaxonId));
				addOrganism.executeUpdate();
				res = addOrganism.getGeneratedKeys();
				res.next();
				organismCacheInt = res.getInt(1);
				res.close();
				return organismCacheInt;
			}
		} catch (SQLException e) {
			System.err.println("Error executing query");
			e.printStackTrace();
		}
		return -1;
	}

	private int getGenusId(int ncbiTaxonId) {
		return getParentxId(ncbiTaxonId, "genus");
	}

	private int getSpeciesId(int ncbiTaxonId) {
		return getParentxId(ncbiTaxonId, "species");
	}

	private int getParentxId(int ncbiTaxonId, String rank) {
		try {
			getParent.setInt(1, ncbiTaxonId);
			ResultSet s = getParent.executeQuery();
			s.next();
			int parent = s.getInt("parentTaxId");
			String r = s.getString("rank");
			s.close();
			if (rank.equals(r))
				return ncbiTaxonId;
			if (parent == 1)
				return -1;
			return getParentxId(parent, rank);
		} catch (Exception e) {
			System.err.println(ncbiTaxonId);
			e.printStackTrace();
		}
		return -1;
	}

	private int getSequenceId(String sequence) {
		if (localSequenceIndex) {
			Integer i = index.get(sequence);
			if (i != null)
				return i;
		}
		try {
			containsSequence.setString(1, sequence);
			ResultSet res = containsSequence.executeQuery();
			if (res.next()) {// return id
				int id = res.getInt("id");
				res.close();
				return id;
			} else {// first add sequence
				res.close();
				addSequence.setString(1, sequence);
				addSequence.executeUpdate();
				res = addSequence.getGeneratedKeys();
				res.next();
				int id = res.getInt(1);
				if (localSequenceIndex)
					index.put(sequence, id);
				res.close();
				return id;
			}
		} catch (SQLException e) {
			System.err.println("Error executing query");
			e.printStackTrace();
		}
		return -1;
	}

	public void addData(String sequence, String organism, int ncbiTaxonId, int position) {
		try {
			addPeptide.setInt(1, getSequenceId(sequence));
			addPeptide.setInt(2, getOrganismId(organism, ncbiTaxonId));
			addPeptide.setInt(3, position);
			addPeptide.executeUpdate();
		} catch (SQLException e) {
			System.err.println("Error executing query");
			e.printStackTrace(System.err);
		}

	}

	public void emptyAllTables() {
		// TRUNCATE TABLE `adresboekje_studierichtingen_03-04`
		Statement stmt;
		try {
			stmt = connection.createStatement();
			try {
				stmt.executeUpdate("TRUNCATE TABLE `peptide`");
				stmt.executeUpdate("TRUNCATE TABLE `sequence`");
				stmt.executeUpdate("TRUNCATE TABLE `organism`");
			} catch (SQLException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			} finally {
				stmt.close();
			}
		} catch (SQLException e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
		}
	}

}
