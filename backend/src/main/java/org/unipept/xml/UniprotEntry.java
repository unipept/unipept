package org.unipept.xml;

import java.util.ArrayList;
import java.util.List;

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

    public UniprotEntry(String type) {
        this.type = type;
        dbReferences = new ArrayList<UniprotDbRef>();
        goReferences = new ArrayList<UniprotGORef>();
        ecReferences = new ArrayList<UniprotECRef>();
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

    public List<Pair> digest() {
        List<Pair> list = new ArrayList<Pair>();
        int position = 0;
        String[] splitArray = sequence.replaceAll("([RK])([^P])", "$1,$2")
                .replaceAll("([RK])([^P,])", "$1,$2").split(",");
        for (String seq : splitArray) {
            if (seq.length() >= MIN_PEPT_SIZE && seq.length() <= MAX_PEPT_SIZE) {
                list.add(new Pair(seq, position));
            }
            position += seq.length();
        }
        return list;
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

    @Override
    public String toString() {
        return uniprotAccessionNumber + ", " + version + ", " + taxonId + ", " + type + ", "
                + sequence;
    }

    public class Pair {
        private String sequence;
        private int position;

        public Pair(String sequence, int position) {
            this.sequence = sequence;
            this.position = position;
        }

        public String getSequence() {
            return sequence;
        }

        public int getPosition() {
            return position;
        }
    }
}
