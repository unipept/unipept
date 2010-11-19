import java.io.BufferedReader;
import java.io.FileReader;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Statement;

public class TaxonLoader {
	// database stuff
	private Connection connection;
	private PreparedStatement addNode;
	private PreparedStatement addName;

	// BioJava
	private final String nodes;
	private final String names;

	public TaxonLoader(String nodes, String names) {
		this.nodes = nodes;
		this.names = names;
		try {
			connection = Database.getConnection();
			prepareStatements();
		} catch (SQLException e) {
			System.err.println("Database connection failed");
			e.printStackTrace(System.err);
		}
	}

	private void prepareStatements() {
		try {
			addNode = connection
					.prepareStatement("INSERT INTO taxon_node (taxId, parentTaxId, rank, geneticCode, mitoCode, isTaxonHidden) VALUES (?,?,?,?,?,?)");
			addName = connection
					.prepareStatement("INSERT INTO taxon_name (taxId, name, nameClass) VALUES (?,?,?)");
		} catch (SQLException e) {
			System.err.println("Error creating prepared statements");
			e.printStackTrace();
		}
	}

	private void addNode(Integer taxId, Integer parentTaxId, String rank, Integer geneticCode,
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

	private void addName(Integer taxId, String name, String nameClass) {
		try {
			addName.setInt(1, taxId);
			addName.setString(2, name);
			addName.setString(3, nameClass);
			addName.executeUpdate();
		} catch (SQLException e) {
			System.err.println("Error executing query");
			e.printStackTrace(System.err);
		}

	}

	private void startLoading() {
		try {
			BufferedReader reader = new BufferedReader(new FileReader(nodes));
			String line;
			while ((line = reader.readLine()) != null) {
				String[] parts = line.split("\\|");
				Integer taxId = Integer.valueOf(parts[0].trim());
				String pti = parts[1].trim();
				Integer parentTaxId = pti.length() > 0 ? new Integer(pti) : null;
				String rank = parts[2].trim();
				Integer geneticCode = new Integer(parts[6].trim());
				Integer mitoCode = new Integer(parts[8].trim());
				Boolean isTaxonHidden = Boolean.valueOf(parts[10].trim());
				addNode(taxId, parentTaxId, rank, geneticCode, mitoCode, isTaxonHidden);
			}

			reader = new BufferedReader(new FileReader(names));
			while ((line = reader.readLine()) != null) {
				String[] parts = line.split("\\|");
				Integer taxId = Integer.valueOf(parts[0].trim());
				String name = parts[1].trim();
				String nameClass = parts[3].trim();
				addName(taxId, name, nameClass);
			}

		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

	public void emptyAllTables() {
		// TRUNCATE TABLE `adresboekje_studierichtingen_03-04`
		Statement stmt;
		try {
			stmt = connection.createStatement();
			try {
				stmt.executeUpdate("TRUNCATE TABLE `taxon_node`");
				stmt.executeUpdate("TRUNCATE TABLE `taxon_name`");
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

	public static void main(String[] args) {
		TaxonLoader tl = new TaxonLoader(args[0], args[1]);
		tl.emptyAllTables();
		tl.startLoading();
	}

}
