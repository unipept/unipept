package org.unipept.storage;

import java.util.Set;
import java.util.HashSet;
import java.util.Map;
import java.util.HashMap;
import java.io.IOException;
import java.io.File;
import java.sql.Timestamp;

import com.sleepycat.je.Database;
import com.sleepycat.je.DatabaseConfig;
import com.sleepycat.je.Environment;
import com.sleepycat.je.EnvironmentConfig;
import com.sleepycat.collections.StoredMap;
import com.sleepycat.bind.tuple.StringBinding;
import com.sleepycat.bind.tuple.IntegerBinding;

import org.unipept.xml.UniprotObserver;
import org.unipept.xml.UniprotDbRef;
import org.unipept.xml.UniprotECRef;
import org.unipept.xml.UniprotEntry;
import org.unipept.xml.UniprotEntry.Pair;
import org.unipept.xml.UniprotGORef;
import org.unipept.storage.CSV;
import org.unipept.taxons.TaxonList;

/**
 * Intermediate class to add PeptideData to the database
 *
 * @author Bart Mesuere
 * @author Felix Van der Jeugt
 *
 */
public class TableWriter implements UniprotObserver {

    public static final String[] ranks = new String[]{"taxon_id", "superkingdom", "kingdom", "subkingdom", "superphylum", "phylum", "subphylum","superclass", "class", "subclass", "infraclass", "superorder", "order", "suborder", "infraorder", "parvorder", "superfamily", "family", "subfamily", "tribe", "subtribe", "genus", "subgenus", "species_group", "species_subgroup", "species", "subspecies", "varietas", "forma"};
    private static final Map<String, Integer> rankIndices = new HashMap<>();

    static {
        for(int i = 0; i < ranks.length; i++) {
            rankIndices.put(ranks[i], i);
        }
    }

    private Map<String, Integer> sequenceIds;
    private TaxonList taxonList;
    private Set<Integer> wrongTaxonIds;

    // csv files
    private CSV.IndexedWriter uniprotEntries;
    private CSV.IndexedWriter peptides;
    private CSV.IndexedWriter refseqCrossReferences;
    private CSV.IndexedWriter emblCrossReferences;
    private CSV.IndexedWriter goCrossReferences;
    private CSV.IndexedWriter ecCrossReferences;
    private CSV.IndexedWriter sequences;

    /**
     * Creates a new data object
     */
    public TableWriter(String berkeleyDir, long berkeleyMem, TaxonList taxonList, String peptidesFile, String sequencesFile, String uniprotEntriesFile, String refseqCrossReferencesFile, String ecCrossReferencesFile, String emblCrossReferencesFile, String goCrossReferencesFile) {
        wrongTaxonIds = new HashSet<Integer>();
        this.taxonList = taxonList;

        /* Opening BerkeleyDB for sequence ID's. */
        try {
            EnvironmentConfig envConfig = new EnvironmentConfig();
            envConfig.setAllowCreate(true);
            envConfig.setCacheSize(berkeleyMem);
            Environment env = new Environment(new File(berkeleyDir), envConfig);
            DatabaseConfig dbConfig = new DatabaseConfig();
            dbConfig.setAllowCreate(true);
            dbConfig.setTemporary(true);
            Database db = env.openDatabase(null, "sequenceIds", dbConfig);
            sequenceIds = new StoredMap<String, Integer>(db, new StringBinding(), new IntegerBinding(), true);
        } catch(Exception e) {
            System.err.println(new Timestamp(System.currentTimeMillis())
                    + " Error creating sequenceIds database.");
            e.printStackTrace();
            System.exit(1);
        }

        /* Opening CSV files for writing. */
        try {
            peptides = new CSV.IndexedWriter(peptidesFile);
            sequences = new CSV.IndexedWriter(sequencesFile);
            uniprotEntries = new CSV.IndexedWriter(uniprotEntriesFile);
            refseqCrossReferences = new CSV.IndexedWriter(refseqCrossReferencesFile);
            ecCrossReferences = new CSV.IndexedWriter(ecCrossReferencesFile);
            emblCrossReferences = new CSV.IndexedWriter(emblCrossReferencesFile);
            goCrossReferences = new CSV.IndexedWriter(goCrossReferencesFile);
        } catch(IOException e) {
            System.err.println(new Timestamp(System.currentTimeMillis())
                    + " Error creating tsv files");
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
        if(0 <= taxonId && taxonId < taxonList.size() && taxonList.get(taxonId) != null) {
            try {
                uniprotEntries.write(
                        uniprotAccessionNumber,
                        Integer.toString(version),
                        Integer.toString(taxonId),
                        type,
                        sequence);
                return uniprotEntries.index();
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
                sequences.write(sequence);
                index = sequences.index();
            } catch(IOException e) {
                System.err.println(new Timestamp(System.currentTimeMillis())
                        + " Error writing to CSV.");
                e.printStackTrace();
            }
            sequenceIds.put(sequence, index);
            return index;
        }
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
                    Integer.toString(getSequenceId(originalSequence)),
                    Integer.toString(uniprotEntryId),
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
            CSV.Writer w = (ref.getType().equals("EMBL"))
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
            sequences.close();
        } catch(IOException e) {
            System.err.println(new Timestamp(System.currentTimeMillis())
                    + " Something closing the csv files.");
            e.printStackTrace();
        }
    }

}
