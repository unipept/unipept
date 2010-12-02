package storage;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;
import java.util.Map;

import org.ardverk.collection.PatriciaTrie;
import org.ardverk.collection.StringKeyAnalyzer;

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

	/**
	 * Default constructor disables local index. If you don't know what you're
	 * doing, use this.
	 */
	public PeptideLoaderData() {
		this(false);
	}

	/**
	 * Creates a new data object
	 * 
	 * @param useLocalSequenceIndex
	 *            enables the use of a local sequence index to reduce database
	 *            lookup and increase speed.
	 */
	public PeptideLoaderData(boolean useLocalSequenceIndex) {
		localSequenceIndex = useLocalSequenceIndex;
		try {
			connection = Database.getConnection();
			prepareStatements();
		} catch (SQLException e) {
			System.err.println(new Timestamp(System.currentTimeMillis())
					+ "Database connection failed");
			e.printStackTrace();
		}
		if (localSequenceIndex)
			initTrie();
	}

	/**
	 * initializes the local sequence index
	 */
	private void initTrie() {
		index = new PatriciaTrie<String, Integer>(StringKeyAnalyzer.INSTANCE);
		// index = new HashMap<String, Integer>();
	}

	/**
	 * creates all prepared statements used in this class.
	 */
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
			System.err.println(new Timestamp(System.currentTimeMillis())
					+ "Error creating prepared statements");
			e.printStackTrace();
		}
	}

	/**
	 * Returns the database ID of the organism with given name and taxonId. If
	 * the organism isn't in the database yet, the organism is inserted.
	 * 
	 * To increase performance, the last requested name and id are stored.
	 * 
	 * @param name
	 *            The name of the organism
	 * @param ncbiTaxonId
	 *            The taxonId of the organism
	 * @return The database ID of the organism
	 */
	private int getOrganismId(String name, int ncbiTaxonId) {
		if (organismCacheString.equals(name))// cache
			return organismCacheInt;
		try {
			organismCacheString = name;
			containsOrganism.setString(1, name);
			ResultSet res = containsOrganism.executeQuery();
			if (res.next()) {// if in database
				organismCacheInt = res.getInt("id");
				res.close();
				return organismCacheInt;
			} else {// else, add to database
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
			System.err.println(new Timestamp(System.currentTimeMillis()) + "Error executing query");
			e.printStackTrace();
		}
		return -1;
	}

	/**
	 * Returns the taxonId of the (parent)node with rank genus
	 * 
	 * @param ncbiTaxonId
	 *            the taxonId of the organism
	 * @return the taxonId of the genus
	 */
	private int getGenusId(int ncbiTaxonId) {
		return getParentxId(ncbiTaxonId, "genus");
	}

	/**
	 * Returns the taxonId of the (parent)node with rank species
	 * 
	 * @param ncbiTaxonId
	 *            the taxonId of the organism
	 * @return the taxonId of the species
	 */
	private int getSpeciesId(int ncbiTaxonId) {
		return getParentxId(ncbiTaxonId, "species");
	}

	/**
	 * Returns the taxonId of the (parent)node with rank x. This method is used
	 * by getSpeciesId and getGenusId and is called recursively.
	 * 
	 * @param ncbiTaxonId
	 *            the taxonId of the organism
	 * @param rank
	 *            the rank we wish to retrieve
	 * @return the taxonId of the genus
	 */
	private int getParentxId(int ncbiTaxonId, String rank) {
		try {
			getParent.setInt(1, ncbiTaxonId);// retrieve parent
			ResultSet s = getParent.executeQuery();
			s.next();
			int parent = s.getInt("parentTaxId");
			String r = s.getString("rank");
			s.close();
			if (rank.equals(r))// if rank matches, return the id
				return ncbiTaxonId;
			if (parent == 1)// if parent is 1, we're at the root of the tree,
							// return -1
				return -1;
			return getParentxId(parent, rank);// recursive call
		} catch (Exception e) {
			System.err.println(new Timestamp(System.currentTimeMillis())
					+ "Error retrieving parent of " + ncbiTaxonId);
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
		if (localSequenceIndex) {// if local index is enabled, try that one
									// first
			Integer i = index.get(sequence);
			if (i != null)
				return i;
		}
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
				if (localSequenceIndex)
					index.put(sequence, id);
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
	 * @param organism
	 *            The name of the organism
	 * @param ncbiTaxonId
	 *            The taxonId of the organism
	 * @param position
	 *            The first position in de the genome of the protein containing
	 *            this peptide
	 */
	public void addData(String sequence, String organism, int ncbiTaxonId, int position) {
		try {
			addPeptide.setInt(1, getSequenceId(sequence));
			addPeptide.setInt(2, getOrganismId(organism, ncbiTaxonId));
			addPeptide.setInt(3, position);
			addPeptide.executeUpdate();
		} catch (SQLException e) {
			System.err.println(new Timestamp(System.currentTimeMillis())
					+ "Error adding this peptide to the database: " + sequence);
			e.printStackTrace();
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
				stmt.executeUpdate("TRUNCATE TABLE `peptide`");
				stmt.executeUpdate("TRUNCATE TABLE `sequence`");
				stmt.executeUpdate("TRUNCATE TABLE `organism`");
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
