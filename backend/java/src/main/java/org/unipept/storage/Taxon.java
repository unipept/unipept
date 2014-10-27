package org.unipept.storage;

public class Taxon {

    public String rank;
    public String name;
    public int parentId;
    public boolean validTaxon;
    public int lineageCount;
    public boolean used;

    public Taxon(int id, String name, String rank, int parentId, boolean validTaxon) {
        this.name = name;
        this.rank = rank;
        this.parentId = parentId;
        this.lineageCount = 0;
        this.validTaxon = validTaxon;
        this.used = false;
    }

}
