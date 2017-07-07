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
    private final int kmerLength;

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

    public UniprotEntry(String type, int kmerLength) {
        this.type = type;
        this.kmerLength = kmerLength;
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
        int length = sequence.length();
        for (int i = 0; i <= length - kmerLength; i++) {
            sequences.add(sequence.substring(i, i + kmerLength));
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
