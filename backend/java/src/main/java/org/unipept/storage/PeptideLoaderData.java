package org.unipept.storage;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.Map;
import java.util.HashMap;

import java.io.BufferedWriter;
import java.io.FileWriter;
import java.io.IOException;
import java.io.File;

import org.unipept.xml.UniprotDbRef;
import org.unipept.xml.UniprotECRef;
import org.unipept.xml.UniprotEntry;
import org.unipept.xml.UniprotEntry.Pair;
import org.unipept.xml.UniprotGORef;
import org.unipept.xml.UniprotObserver;

import org.mapdb.DBMaker;

import com.mysql.jdbc.exceptions.jdbc4.MySQLIntegrityConstraintViolationException;

import com.sleepycat.je.EnvironmentConfig;
import com.sleepycat.je.DatabaseConfig;
//import com.sleepycat.je.Database;
import com.sleepycat.collections.StoredMap;
import com.sleepycat.je.Environment;
import com.sleepycat.bind.tuple.StringBinding;
import com.sleepycat.bind.tuple.IntegerBinding;

/**
 * Intermediate class to add PeptideData to the database
 * 
 * @author Bart Mesuere
 * @author Felix Van der Jeugt
 * 
 */
public class PeptideLoaderData implements UniprotObserver {
    private Connection connection;
    private PreparedStatement addLineage;
    private PreparedStatement addInvalidLineage;
    private PreparedStatement lineageExists;

    private Map<String, Integer> sequenceIds;
    private ArrayList<Taxon> taxons;
    private Set<Integer> wrongTaxonIds;

    // csv files
    private CSVWriter uniprotEntries;
    private CSVWriter peptides;
    private CSVWriter refseqCrossReferences;
    private CSVWriter emblCrossReferences;
    private CSVWriter goCrossReferences;
    private CSVWriter ecCrossReferences;

    /**
     * Creates a new data object
     */
    public PeptideLoaderData() {
        wrongTaxonIds = new HashSet<Integer>();
        taxons = new ArrayList<Taxon>();

        /* Opening BerkeleyDB for sequence ID's. */
        try {
            EnvironmentConfig envConfig = new EnvironmentConfig();
            envConfig.setAllowCreate(true);
            envConfig.setCacheSize(500000);
            Environment env = new Environment(new File("/run/media/felix/memoria/home/"), envConfig);
            DatabaseConfig dbConfig = new DatabaseConfig();
            dbConfig.setAllowCreate(true);
            //dbConfig.setDeferredWrite(true);
            dbConfig.setTemporary(true);
            com.sleepycat.je.Database db = env.openDatabase(null, "sequenceIds", dbConfig);
            sequenceIds = new StoredMap<String, Integer>(db, new StringBinding(), new IntegerBinding(), true);
        } catch(Exception e) {
            System.err.println(new Timestamp(System.currentTimeMillis())
                    + " Error creating sequenceIds database.");
            e.printStackTrace();
            System.exit(1);
        }

        /* Opening CSV files for writing. */
        try {
            uniprotEntries = new CSVWriter("uniprotEntries.tsv", "uniprot_accession_number", "version", "taxon_id", "type", "protein");
            peptides = new CSVWriter("peptides.tsv", "sequence_id", "uniprot_entry_id", "original_sequence_id", "position");
            refseqCrossReferences = new CSVWriter("refseq_cross_references.tsv", "uniprot_entry_id", "protein_id", "sequence_id");
            emblCrossReferences = new CSVWriter("embl_cross_references.tsv", "uniprot_entry_id", "protein_id", "sequence_id");
            goCrossReferences = new CSVWriter("go_cross_references.tsv", "uniprot_entry_id", "go_id");
            ecCrossReferences = new CSVWriter("ec_cross_references.tsv", "uniprot_entry_id", "ec_id");
        } catch(IOException e) {
            System.err.println(new Timestamp(System.currentTimeMillis())
                    + " Error creating tsv files");
            e.printStackTrace();
            System.exit(1);
        }

        /* Reading the available taxons from the database. */
        try {
            connection = Database.getConnection();
        } catch(SQLException e) {
            System.err.println(new Timestamp(System.currentTimeMillis())
                    + "Database connection failed");
            e.printStackTrace();
            System.exit(1);
        }

        Statement stmt = null;
        try {
            stmt = connection.createStatement();
            ResultSet rs = stmt.executeQuery("SELECT id, rank, parent_id, valid_taxon FROM taxons ORDER BY id ASC");
            while(rs.next()) {
                int id = rs.getInt("id");
                while(id < taxons.size()) taxons.add(null); // In case of deleted taxons.
                taxons.add(new Taxon(rs.getString("rank"), rs.getInt("parent_id"), rs.getBoolean("valid_taxon")));
            }
            stmt.close();
        } catch(SQLException e) {
            System.err.println(new Timestamp(System.currentTimeMillis())
                    + "Taxon retrieval failed.");
            e.printStackTrace();
            System.exit(1);
        }

        /* Prepaering Lineage statements. */
        try {
            addLineage = connection.prepareStatement("INSERT INTO lineages (`taxon_id`) VALUES (?)");
            addInvalidLineage = connection.prepareStatement("INSERT INTO lineages (`taxon_id`, `superkingdom`, `kingdom`, `subkingdom`, `superphylum`, `phylum`, `subphylum`,`superclass`, `class`, `subclass`, `infraclass`, `superorder`, `order`, `suborder`, `infraorder`, `parvorder`, `superfamily`, `family`, `subfamily`, `tribe`, `subtribe`, `genus`, `subgenus`, `species_group`, `species_subgroup`, `species`, `subspecies`, `varietas`, `forma`) VALUES (?, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1)");
            lineageExists = connection.prepareStatement("SELECT COUNT(*) AS aantal FROM lineages WHERE `taxon_id` = ?");
        } catch(SQLException e) {
            System.err.println(new Timestamp(System.currentTimeMillis())
                    + " Error creating prepared statements");
            e.printStackTrace();
            System.exit(1);
        }

    }

    /**
     * Stores a complete UniprotEntry in the database
     *
     * @param entry
     *            the UniprotEntry to store
     */
    public void store(UniprotEntry entry) {
        int uniprotEntryId = addUniprotEntry(entry.getUniprotAccessionNumber(), entry.getVersion(),
                entry.getTaxonId(), entry.getType(), entry.getSequence());
        if (uniprotEntryId != -1) { // failed to add entry
            for (Pair p : entry.digest())
                addData(p.getSequence().replace("I", "L"), uniprotEntryId, p.getSequence(),
                        p.getPosition());
            for (UniprotDbRef ref : entry.getDbReferences())
                addDbRef(ref, uniprotEntryId);
            for (UniprotGORef ref : entry.getGOReferences())
                addGORef(ref, uniprotEntryId);
            for (UniprotECRef ref : entry.getECReferences())
                addECRef(ref, uniprotEntryId);
        }
    }

    /**
     *
     * Inserts the entry info of a uniprot entry into the database and returns
     * the generated id.
     *
     * @param uniprotAccessionNumber
     *            The accession number of the entry
     * @param version
     *            The version of the entry
     * @param taxonId
     *            The taxonId of the organism of the entry
     * @param type
     *            The type of the entry. Can be swissprot or trembl
     * @param sequence
     *            The full sequence of the peptide.
     * @return The database ID of the uniprot entry.
     */
    public int addUniprotEntry(String uniprotAccessionNumber, int version, int taxonId,
            String type, String sequence) {
        if(0 <= taxonId && taxonId < taxons.size() && taxons.get(taxonId) != null) {
            try {
                int id = uniprotEntries.write(
                        uniprotAccessionNumber,
                        Integer.toString(version),
                        Integer.toString(taxonId),
                        type,
                        sequence);
                taxons.get(taxonId).used = true;
                return id;
            } catch(IOException e) {
                System.err.println(new Timestamp(System.currentTimeMillis())
                        + " Error writing to CSV.");
                e.printStackTrace();
            }
        } else {
            if (!wrongTaxonIds.contains(taxonId)) {
                wrongTaxonIds.add(taxonId);
                System.err.println(new Timestamp(System.currentTimeMillis()) + " " + taxonId
                        + " added to the list of " + wrongTaxonIds.size() + " invalid taxonIds.");
            }
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
        if(sequenceIds.containsKey(sequence)) {
            return sequenceIds.get(sequence);
        } else {
            sequenceIds.put(sequence, sequenceIds.size() + 1);
            return sequenceIds.size();
        }
        //return sequenceIds.putIfAbsent(sequence, sequenceIds.size() + 1);
    }

    /**
     * Adds peptide data to the database
     *
     * @param sequence
     *            The sequence of the peptide
     * @param uniprotEntryId
     *            The id of the uniprot entry from which the peptide data was
     *            retrieved.
     * @param position
     *            The starting position of the sequence in the full protein
     */
    public void addData(String sequence, int uniprotEntryId, String originalSequence, int position) {
        try {
            peptides.write(
                    Integer.toString(getSequenceId(sequence)),
                    Integer.toString(uniprotEntryId),
                    Integer.toString(getSequenceId(originalSequence)),
                    Integer.toString(position)
                    );
        } catch(IOException e) {
            System.err.println(new Timestamp(System.currentTimeMillis())
                    + " Error adding this peptide to the database: " + sequence);
            e.printStackTrace();
        }
    }

    /**
     * Adds a uniprot entry cross reference to the database
     *
     * @param ref
     *            The uniprot cross reference to add
     * @param uniprotEntryId
     *            The uniprotEntry of the cross reference
     */
    public void addDbRef(UniprotDbRef ref, int uniprotEntryId) {
        try {
            CSVWriter w = (ref.getType().equals("EMBL"))
                ? emblCrossReferences
                : refseqCrossReferences;
            w.write(Integer.toString(uniprotEntryId),
                    ref.getProteinId(),
                    ref.getSequenceId());
        } catch (IOException e) {
            System.err.println(new Timestamp(System.currentTimeMillis())
                    + " Error adding this cross reference to the database.");
            e.printStackTrace();
        }
    }

    /**
     * Adds a uniprot entry GO reference to the database
     *
     * @param ref
     *            The uniprot GO reference to add
     * @param uniprotEntryId
     *            The uniprotEntry of the cross reference
     */
    public void addGORef(UniprotGORef ref, int uniprotEntryId) {
        try {
            goCrossReferences.write(Integer.toString(uniprotEntryId), ref.getId());
        } catch (IOException e) {
            System.err.println(new Timestamp(System.currentTimeMillis())
                    + " Error adding this GO reference to the database.");
            e.printStackTrace();
        }

    }

    /**
     * Adds a uniprot entry EC reference to the database
     *
     * @param ref
     *            The uniprot EC reference to add
     * @param uniprotEntryId
     *            The uniprotEntry of the cross reference
     */
    public void addECRef(UniprotECRef ref, int uniprotEntryId) {
        try {
            ecCrossReferences.write(Integer.toString(uniprotEntryId), ref.getId());
        } catch (IOException e) {
            System.err.println(new Timestamp(System.currentTimeMillis())
                    + " Error adding this EC reference to the database.");
            e.printStackTrace();
        }

    }

    /**
     * Returns a List containing all the taxonIds of which the database contains
     * a peptide
     *
     * @return a list of taxonIds
     */
    public List<Integer> getUniqueTaxonIds() {
        List<Integer> result = new ArrayList<Integer>();
        for(int i = 0; i < taxons.size(); i++) {
            if(taxons.get(i).used) result.add(i);
        }
        return result;
    }

    /**
     * Adds the complete lineage to the database for the given taxonomic
     * element.
     *
     * @param taxonId
     *            The taxonId of the organism
     */
    public void addLineage(int taxonId) {
        try { 
            lineageExists.setInt(1, taxonId);
            ResultSet rs = lineageExists.executeQuery();
            if (rs.next() && rs.getInt("aantal") == 0) {
                if (0 <= taxonId && taxonId < taxons.size() && taxons.get(taxonId) != null) {
                    if (taxons.get(taxonId).validTaxon) {
                        addLineage.setInt(1, taxonId);
                        addLineage.executeUpdate();
                    } else {
                        addInvalidLineage.setInt(1, taxonId);
                        addInvalidLineage.executeUpdate();
                    }
                    updateLineage(taxonId, taxonId);
                }
            }
            rs.close();
        } catch (SQLException e) {
            System.err.println(new Timestamp(System.currentTimeMillis())
                    + " Something went wrong with the database");
            e.printStackTrace();
        }
    }

    /**
     * Updates the lineage record of the given taxonId with the information in
     * the Taxon record of parentId
     *
     * @param taxonId
     *            The taxonId of the record that needs updating
     * @param parentId
     *            The taxonId of the record containing new information
     * @throws SQLException
     */
    private void updateLineage(int taxonId, int parentId) throws SQLException {
        // if the parent == 1, we're at the root
        if (parentId != 1) {
            if (taxonId != parentId) {
                addLineage(parentId);
            }
            // retrieve the parent info
            if (0 <= parentId && parentId < taxons.size() && taxons.get(parentId) != null) {
                String rank = taxons.get(parentId).rank;

                // if we have a valid rank, update the lineage
                if (!rank.equals("no rank")) {
                    rank = rank.replace(' ', '_');
                    Statement stmt = connection.createStatement();

                    if (taxons.get(parentId).validTaxon)// normal case
                    {
                        stmt.executeUpdate("UPDATE lineages SET `" + rank + "` = " + parentId
                                + " WHERE `taxon_id` = " + taxonId);
                    } else
                        // invalid
                    {
                        stmt.executeUpdate("UPDATE lineages SET `" + rank + "` = "
                                + (-1 * parentId) + " WHERE `taxon_id` = " + taxonId);
                    }

                    stmt.close();
                }

                // recursion if fun!
                updateLineage(taxonId, taxons.get(parentId).parentId);
            }
        }
    }

    /**
     * Truncates all peptide tables
     * TODO
     */
    public void emptyAllTables() {
        try {
            Statement stmt = connection.createStatement();
            try {
                stmt.executeQuery("SET FOREIGN_KEY_CHECKS=0");
                stmt.executeUpdate("TRUNCATE TABLE `peptides`");
                stmt.executeUpdate("TRUNCATE TABLE `sequences`");
                stmt.executeUpdate("TRUNCATE TABLE `uniprot_entries`");
                stmt.executeUpdate("TRUNCATE TABLE `refseq_cross_references`");
                stmt.executeUpdate("TRUNCATE TABLE `embl_cross_references`");
                stmt.executeUpdate("TRUNCATE TABLE `ec_cross_references`");
                stmt.executeUpdate("TRUNCATE TABLE `go_cross_references`");
                stmt.executeUpdate("TRUNCATE TABLE `lineages`");
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

    public void emptyLineages() {
        try {
            Statement stmt = connection.createStatement();
            try {
                stmt.executeUpdate("TRUNCATE TABLE `lineages`");
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

    @Override
    public void handleEntry(UniprotEntry entry) {
        store(entry);
    }

    @Override
    public void close() {
        try {
            uniprotEntries.close();
            peptides.close();
            refseqCrossReferences.close();
            emblCrossReferences.close();
            goCrossReferences.close();
            ecCrossReferences.close();
        } catch(IOException e) {
            System.err.println(new Timestamp(System.currentTimeMillis())
                    + " Something closing the csv files.");
            e.printStackTrace();
        }
    }

    private class CSVWriter {
        private BufferedWriter buffer;
        private int index = 0;
        public CSVWriter(String file, String... titles) throws IOException {
            buffer = new BufferedWriter(new FileWriter(file));
            buffer.write("id");
            for(int i = 0; i < titles.length; i++) {
                buffer.write("	" + titles[i].toString());
            }
            buffer.newLine();
        }
        public int write(String... values) throws IOException {
            buffer.write(++index);
            for(int i = 0; i < values.length; i++) {
                buffer.write("	" + values[i]);
            }
            buffer.newLine();
            return index;
        }
        public void close() throws IOException {
            buffer.flush();
            buffer.close();
        }
    }

    private class Taxon {
        public String rank;
        public int parentId;
        public boolean validTaxon;
        public int lineageCount;
        public boolean used;
        public Taxon(String rank, int parentId, boolean validTaxon) {
            this.rank = rank;
            this.parentId = parentId;
            this.lineageCount = 0;
            this.validTaxon = validTaxon;
            this.used = false;
        }
    }
}
