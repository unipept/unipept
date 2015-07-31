package org.unipept.xml;

import org.unipept.xml.UniprotEntry;

public interface UniprotObserver {
    public void handleEntry(UniprotEntry entry);
    public void close();
}
