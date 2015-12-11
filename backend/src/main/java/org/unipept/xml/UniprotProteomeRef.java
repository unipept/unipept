package org.unipept.xml;

public class UniprotProteomeRef {

    private final String id;

    public UniprotProteomeRef(String id) {
        this.id = id;
    }

    public String getId() {
        return id;
    }


    public boolean equals(Object o) {
        if ( this == o ) return true;
        if ( !(o instanceof UniprotProteomeRef) ) return false;
        UniprotProteomeRef upref = (UniprotProteomeRef) o;
        return upref.getId().equals(getId());
    }
}
