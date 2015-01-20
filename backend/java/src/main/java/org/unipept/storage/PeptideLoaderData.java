package org.unipept.storage;

import java.sql.Timestamp;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.Map;
import java.util.HashMap;

import java.lang.RuntimeException;

import java.io.IOException;
import java.io.File;

import org.unipept.xml.UniprotDbRef;
import org.unipept.xml.UniprotECRef;
import org.unipept.xml.UniprotEntry;
import org.unipept.xml.UniprotEntry.Pair;
import org.unipept.xml.UniprotGORef;
import org.unipept.xml.UniprotObserver;

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

    public static final String[] ranks = new String[]{"taxon_id", "superkingdom", "kingdom", "subkingdom", "superphylum", "phylum", "subphylum","superclass", "class", "subclass", "infraclass", "superorder", "order", "suborder", "infraorder", "parvorder", "superfamily", "family", "subfamily", "tribe", "subtribe", "genus", "subgenus", "species_group", "species_subgroup", "species", "subspecies", "varietas", "forma"};
    private static final Map<String, Integer> rankIndices = new HashMap<>();

    {
        for(int i = 0; i < ranks.length; i++) {
            rankIndices.put(ranks[i], i);
        }
    }

    private Map<String, Integer> sequenceIds;
    private ArrayList<Taxon> taxons;
    private Set<Integer> wrongTaxonIds;
    private Set<Integer> existingLineages;

    // csv files
    private CSVWriter uniprotEntries;
    private CSVWriter peptides;
    private CSVWriter refseqCrossReferences;
    private CSVWriter emblCrossReferences;
    private CSVWriter goCrossReferences;
    private CSVWriter ecCrossReferences;
    private CSVWriter lineages;
    private CSVWriter sequences;

    /**
     * Creates a new data object
     */
    public PeptideLoaderData() {
        wrongTaxonIds = new HashSet<Integer>();
        taxons = new ArrayList<Taxon>();
        existingLineages = new HashSet<Integer>();

        /* Opening BerkeleyDB for sequence ID's. */
        try {
            EnvironmentConfig envConfig = new EnvironmentConfig();
            envConfig.setAllowCreate(true);
            envConfig.setCacheSize(500000000);
            //envConfig.setCacheSize(100000000000L);
            Environment env = new Environment(new File(System.getenv("BDBDIR")), envConfig);
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
            uniprotEntries = new CSVWriter("uniprot_entries");
            peptides = new CSVWriter("peptides");
            refseqCrossReferences = new CSVWriter("refseq_cross_references");
            emblCrossReferences = new CSVWriter("embl_cross_references");
            goCrossReferences = new CSVWriter("go_cross_references");
            ecCrossReferences = new CSVWriter("ec_cross_references");
            lineages = new CSVWriter("lineages");
            sequences = new CSVWriter("sequences");
        } catch(IOException e) {
            System.err.println(new Timestamp(System.currentTimeMillis())
                    + " Error creating tsv files");
            e.printStackTrace();
            System.exit(1);
        }

        /* Reading the available taxons from the database. */
        try {
            CSVReader reader = new CSVReader("taxons");
            String[] items;
            while((items = reader.read()) != null) {
                int id = Integer.parseUnsignedInt(items[0]);
                boolean valid = items[4].charAt(0) == (char) 1;
                while(id > taxons.size()) taxons.add(null); // In case of deleted taxons.
                if(id != 0) taxons.add(new Taxon(id, items[1], items[2], Integer.parseInt(items[3]), valid));
            }
        } catch(IOException e) {
            System.err.println(new Timestamp(System.currentTimeMillis())
                    + " Taxon retrieval failed.");
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
            int index = 0;
            try {
                index = sequences.write(sequence);
            } catch(IOException e) {
                System.err.println(new Timestamp(System.currentTimeMillis())
                        + " Error writing to CSV.");
                e.printStackTrace();
            }
            sequenceIds.put(sequence, index);
            return index;
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
            if(taxons.get(i) != null && taxons.get(i).used) result.add(i);
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
        if(0 > taxonId && taxonId >= taxons.size() || taxons.get(taxonId) == null) {
            // That's not a taxon we have!
            return;
        }

        if(existingLineages.add(taxonId)) {

            // Let's build a new lineage.
            String[] lineage = new String[ranks.length];
            lineage[0] = Integer.toString(taxonId); // 0 is taxon_id

            if(!taxons.get(taxonId).validTaxon) {
                // It's an invalid lineage. Put it in the lineages as invalid.
                for(int i = 1; i < ranks.length; i++) lineage[i] = "-1";
            }

            // Iterate over ancestors, starting with itself.
            int parentId = taxonId;
            while(parentId != 1) {
                if(taxonId != parentId) addLineage(parentId);
                if(0 <= parentId && parentId < taxons.size() && taxons.get(parentId) != null) {
                    String rank = taxons.get(parentId).rank;
                    if(rank != null && !rank.equals("no rank")) {
                        rank = rank.replace(' ', '_');
                        lineage[rankIndices.get(rank)] = Integer.toString((taxons.get(parentId).validTaxon ? 1 : -1) * parentId);
                    }
                }
                parentId = taxons.get(parentId).parentId;
            }

            try {
                // Write away the lineage.
                lineages.write(lineage);
            } catch(IOException e) {
                System.err.println(new Timestamp(System.currentTimeMillis())
                        + " Error writing taxon " + taxonId + " to lineage file");
                e.printStackTrace();
            }
        }
    }

    /**
     * Truncates all peptide tables
     */
    public void emptyAllTables() {
        // TODO remove tsv files?
        // stmt.executeQuery("SET FOREIGN_KEY_CHECKS=0");
        // stmt.executeUpdate("TRUNCATE TABLE `peptides`");
        // stmt.executeUpdate("TRUNCATE TABLE `sequences`");
        // stmt.executeUpdate("TRUNCATE TABLE `uniprot_entries`");
        // stmt.executeUpdate("TRUNCATE TABLE `refseq_cross_references`");
        // stmt.executeUpdate("TRUNCATE TABLE `embl_cross_references`");
        // stmt.executeUpdate("TRUNCATE TABLE `ec_cross_references`");
        // stmt.executeUpdate("TRUNCATE TABLE `go_cross_references`");
        // stmt.executeUpdate("TRUNCATE TABLE `lineages`");
        // stmt.executeQuery("SET FOREIGN_KEY_CHECKS=1");
    }

    public void emptyLineages() {
        // TODO remove tsv file?
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
            lineages.close();
            sequences.close();
        } catch(IOException e) {
            System.err.println(new Timestamp(System.currentTimeMillis())
                    + " Something closing the csv files.");
            e.printStackTrace();
        }
    }

}
