package org.unipept.xml;

import java.util.Arrays;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;

/**
 * @author Bart Mesuere
 * 
 */
public class UniprotEntry {

    // peptide settings
    private static final int MIN_PEPT_SIZE = 5;
    private static final int MAX_PEPT_SIZE = 50;

    private String uniprotAccessionNumber;
    private int version;
    private int taxonId;
    private String type;
    private String recommendedName;
    private String submittedName;
    private String sequence;
    private List<UniprotDbRef> dbReferences;
    private List<UniprotGORef> goReferences;
    private List<UniprotECRef> ecReferences;
    private List<UniprotProteomeRef> protReferences;
    private List<String> sequences;

    public UniprotEntry(String type) {
        this.type = type;
        dbReferences = new ArrayList<UniprotDbRef>();
        goReferences = new ArrayList<UniprotGORef>();
        ecReferences = new ArrayList<UniprotECRef>();
        protReferences = new ArrayList<UniprotProteomeRef>();
        sequences = new ArrayList<String>();
    }

    public void reset(String type) {
        uniprotAccessionNumber = null;
        version = 0;
        taxonId = 0;
        this.type = type;
        recommendedName = null;
        submittedName = null;
        sequence = null;
        dbReferences.clear();
        goReferences.clear();
        ecReferences.clear();
        protReferences.clear();
        sequences.clear();
    }

    public String getUniprotAccessionNumber() {
        return uniprotAccessionNumber;
    }

    public void setUniprotAccessionNumber(String uniprotAccessionNumber) {
        if(this.uniprotAccessionNumber == null) {
            this.uniprotAccessionNumber = uniprotAccessionNumber;
        }
    }

    public int getVersion() {
        return version;
    }

    public void setVersion(int version) {
        this.version = version;
    }

    public int getTaxonId() {
        return taxonId;
    }

    public void setTaxonId(int taxonId) {
        this.taxonId = taxonId;
    }

    public String getType() {
        return type;
    }

    public String getName() {
        if(recommendedName != null) return recommendedName;
        return submittedName;
    }

    public void setRecommendedName(String name) {
        recommendedName = name;
    }

    public void setSubmittedName(String name) {
        submittedName = name;
    }

    public String getSequence() {
        return sequence;
    }

    public void setSequence(String sequence) {
        this.sequence = sequence;
    }

    public void addDbRef(UniprotDbRef ref) {
        dbReferences.add(ref);
    }

    public void addGORef(UniprotGORef ref) {
        goReferences.add(ref);
    }

    public void addECRef(UniprotECRef ref) {
        ecReferences.add(ref);
    }

    public void addProtRef(UniprotProteomeRef ref) {
        for (UniprotProteomeRef r : protReferences) {
            if (ref.equals(r)) {
                return;
            }
        }
        protReferences.add(ref);
    }

    public List<String> digest() {
        sequences.clear();
        int start = 0;
        int length = sequence.length();
        for (int i = 0; i < length; i++) {
            char x = sequence.charAt(i);
            if ((x == 'K' || x == 'R') && (i + 1 < length && sequence.charAt(i + 1) != 'P')) {
                if (i + 1 - start >= MIN_PEPT_SIZE && i + 1 - start <= MAX_PEPT_SIZE) {
                    sequences.add(sequence.substring(start, i + 1));
                }
                start = i + 1;
            }
        }
        if (length - start >= MIN_PEPT_SIZE && length - start <= MAX_PEPT_SIZE) {
            sequences.add(sequence.substring(start, length));
        }
        return sequences;
    }

    public List<UniprotDbRef> getDbReferences() {
        return dbReferences;
    }

    public List<UniprotGORef> getGOReferences() {
        return goReferences;
    }

    public List<UniprotECRef> getECReferences() {
        return ecReferences;
    }

    public List<UniprotProteomeRef> getProtReferences() {
        return protReferences;
    }


    @Override
    public String toString() {
        return uniprotAccessionNumber + ", " + version + ", " + taxonId + ", " + type + ", "
                + sequence;
    }

}
