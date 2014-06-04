package xml;

import xml.UniprotEntry;

public interface UniprotObserver {
	public void handleEntry(UniprotEntry entry);
}
