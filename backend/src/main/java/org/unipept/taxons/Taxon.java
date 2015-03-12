package org.unipept.taxons;

import java.util.EnumMap;
import java.util.Map;

public class Taxon {

    final public String name;
    final public Rank rank;
    final public int parent;

    public boolean valid;

    public Taxon(String name, Rank rank, int parent) {
        this.name = name;
        this.rank = rank;
        this.parent = parent;
        this.valid = true;
    }

    public void invalidate() {
        this.valid = false;
    }

    public boolean valid() {
        return this.valid;
    }


    public static enum Rank {
        SUPERKINGDOM, KINGDOM, SUBKINGDOM, SUPERPHYLUM, PHYLUM, SUBPHYLUM,
        SUPERCLASS, CLASS, SUBCLASS, INFRACLASS, SUPERORDER, ORDER,
        SUBORDER, INFRAORDER, PARVORDER, SUPERFAMILY, FAMILY, SUBFAMILY,
        TRIBE, SUBTRIBE, GENUS, SUBGENUS, SPECIES_GROUP, SPECIES_SUBGROUP,
        SPECIES, SUBSPECIES, VARIETAS, FORMA, NO_RANK;

        public static final Rank[] values = Rank.values();

        private static final Map<Rank, Integer> indices = new EnumMap<Rank, Integer>(Rank.class);
        static {
            for(int i = 0; i < values.length; i++) {
                indices.put(values[i], i);
            }
        }

        public int index() {
            return indices.get(this);
        }

        public String toString() {
            return this.name().toLowerCase().replace('_', ' ');
        }

        public static Rank fromString(String s) {
            return valueOf(s.toUpperCase().replace(' ', '_'));
        }
    }

}
