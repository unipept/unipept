package org.unipept.xml;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.xml.sax.Attributes;
import org.xml.sax.SAXException;
import org.xml.sax.helpers.DefaultHandler;

public class UniprotHandler extends DefaultHandler {

    private final String uniprotType;

    private UniprotEntry currentItem;
    private UniprotDbRef dbRef;
    private UniprotGORef goRef;
    private UniprotECRef ecRef;
    private UniprotProteomeRef protRef;
    private StringBuilder charData;
    private int i;
    private boolean inOrganism = false;
    private boolean inEvidence = false;
    private boolean inRecommendedName = false;
    private boolean inSubmittedName = false;
    private List<UniprotObserver> observers;

    private Map<String, EndTagWorker> endTagWorkers;
    private Map<String, StartTagWorker> startTagWorkers;

    public UniprotHandler(int peptideMinLength, int peptideMaxLength, String uniprotType) {
        super();
        this.uniprotType = uniprotType;
        currentItem = new UniprotEntry(uniprotType, peptideMinLength, peptideMaxLength);
        charData = new StringBuilder();
        observers = new ArrayList<UniprotObserver>();
        i = 0;

        // set up end tag workers
        endTagWorkers = new HashMap<String, EndTagWorker>();
        endTagWorkers.put("entry", new EndTagWorker() {
            @Override
            public void handleTag(String data) {
                emitEntry(currentItem);
                i++;
                if (i % 10000 == 0) System.out.println(
                    new Timestamp(System.currentTimeMillis())
                    + " Entry " + i + " added"
                );
            }
        });
        endTagWorkers.put("accession", new EndTagWorker() {
            @Override
            public void handleTag(String data) {
                currentItem.setUniprotAccessionNumber(data);
            }
        });
        endTagWorkers.put("organism", new EndTagWorker() {
            @Override
            public void handleTag(String data) {
                inOrganism = false;
            }
        });
        endTagWorkers.put("evidence", new EndTagWorker() {
            @Override
            public void handleTag(String data) {
                inEvidence = false;
            }
        });
        endTagWorkers.put("recommendedName", new EndTagWorker() {
            @Override
            public void handleTag(String data) {
                inRecommendedName = false;
            }
        });
        endTagWorkers.put("submittedName", new EndTagWorker() {
            @Override
            public void handleTag(String data) {
                inSubmittedName = false;
            }
        });
        endTagWorkers.put("sequence", new EndTagWorker() {
            @Override
            public void handleTag(String data) {
                currentItem.setSequence(data);
            }
        });
        endTagWorkers.put("dbReference", new EndTagWorker() {
            @Override
            public void handleTag(String data) {
                if (!inOrganism) {
                    if (dbRef != null) {
                        currentItem.addDbRef(dbRef);
                        dbRef = null;
                    } else if (goRef != null) {
                        currentItem.addGORef(goRef);
                        goRef = null;
                    } else if (ecRef != null) {
                        currentItem.addECRef(ecRef);
                        ecRef = null;
                    } else if (protRef != null) {
                        currentItem.addProtRef(protRef);
                        protRef = null;
                    }
                }
            }
        });
        endTagWorkers.put("fullName", new EndTagWorker() {
            @Override
            public void handleTag(String data) {
                if (inRecommendedName) {
                    currentItem.setRecommendedName(data);
                } else if (inSubmittedName) {
                    currentItem.setSubmittedName(data);
                }
            }
        });

        // set up start tag workers
        startTagWorkers = new HashMap<String, StartTagWorker>();
        startTagWorkers.put("entry", new StartTagWorker() {
            @Override
            public void handleTag(Attributes atts) {
                newCurrentItem();
                currentItem.setVersion(Integer.valueOf(atts.getValue("version")));
            }
        });
        startTagWorkers.put("organism", new StartTagWorker() {
            @Override
            public void handleTag(Attributes atts) {
                inOrganism = true;
            }
        });
        startTagWorkers.put("evidence", new StartTagWorker() {
            @Override
            public void handleTag(Attributes atts) {
                inEvidence = true;
            }
        });
        startTagWorkers.put("recommendedName", new StartTagWorker() {
            @Override
            public void handleTag(Attributes atts) {
                inRecommendedName = true;
            }
        });
        startTagWorkers.put("submittedName", new StartTagWorker() {
            @Override
            public void handleTag(Attributes atts) {
                inSubmittedName = true;
            }
        });
        startTagWorkers.put("dbReference", new StartTagWorker() {
            @Override
            public void handleTag(Attributes atts) {
                if (inOrganism) {
                    if (atts.getValue("type").equals("NCBI Taxonomy"))
                        currentItem.setTaxonId(Integer.valueOf(atts.getValue("id")));
                } else if (!inEvidence) {
                    if (atts.getValue("type").equals("EMBL")) {
                        dbRef = new UniprotDbRef("EMBL");
                        dbRef.setSequenceId(atts.getValue("id"));
                    } else if (atts.getValue("type").equals("RefSeq")) {
                        dbRef = new UniprotDbRef("RefSeq");
                        dbRef.setProteinId(atts.getValue("id"));
                    } else if (atts.getValue("type").equals("GO")) {
                        goRef = new UniprotGORef(atts.getValue("id"));
                    } else if (atts.getValue("type").equals("EC")) {
                        ecRef = new UniprotECRef(atts.getValue("id"));
                    } else if (atts.getValue("type").equals("Proteomes")) {
                        protRef = new UniprotProteomeRef(atts.getValue("id"));
                    }
                }
            }
        });
        startTagWorkers.put("property", new StartTagWorker() {
            @Override
            public void handleTag(Attributes atts) {
                if (dbRef != null) {
                    if (atts.getValue("type").equals("protein sequence ID"))
                        dbRef.setProteinId(atts.getValue("value"));
                    else if (atts.getValue("type").equals("nucleotide sequence ID"))
                        dbRef.setSequenceId(atts.getValue("value"));
                }
            }
        });
    }

    @Override
    public void startElement(String namespaceURI, String localName, String qName, Attributes atts) {
        StartTagWorker worker = startTagWorkers.get(qName);
        if (worker != null) {
            worker.handleTag(atts);
        }
    }

    @Override
    public void endElement(String uri, String localName, String qName) throws SAXException {
        EndTagWorker worker = endTagWorkers.get(qName);
        if (worker != null) {
            worker.handleTag(charData.toString().trim());
        }
        charData.delete(0, charData.length());
    }

    @Override
    public void characters(char[] ch, int start, int length) throws SAXException {
        charData.append(ch, start, length);
    }

    private void newCurrentItem() {
        currentItem.reset(uniprotType);
    }

    private interface StartTagWorker {
        void handleTag(Attributes att);
    }

    private interface EndTagWorker {
        void handleTag(String data);
    }

    public void addObserver(UniprotObserver o) {
        observers.add(o);
    }

    private void emitEntry(UniprotEntry entry) {
        for (UniprotObserver o : observers) {
            o.handleEntry(entry);
        }
    }
}
