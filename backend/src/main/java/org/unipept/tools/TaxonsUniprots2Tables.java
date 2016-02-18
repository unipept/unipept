package org.unipept.tools;

import java.io.InputStream;
import java.io.IOException;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.util.zip.GZIPInputStream;

import javax.xml.parsers.SAXParser;
import javax.xml.parsers.SAXParserFactory;
import javax.xml.parsers.ParserConfigurationException;

import org.xml.sax.SAXException;

import org.unipept.xml.UniprotHandler;
import org.unipept.taxons.TaxonList;
import org.unipept.storage.TableWriter;

public class TaxonsUniprots2Tables {

    /**
     * Parse the uniprot xml files into TSV tables.
     *
     * The first parameter is the name of an existing directory, which will be
     * used to store a temporary database. The second parameter is a taxon file, as written by NamesNodes2Taxons. The
     * next 7 parameters are the output files, all in TSV format. In order, they
     * are: the peptides, the sequences, the uniprot entries, the RefSeq cross
     * references, the EC cross references, the EMBL cross references and the GO
     * cross references.
     *
     * The rest of the parameters comes in pairs. Each pair is a uniprot xml
     * file to parse and the "type" the entries parsed from this file should get
     * in the uniprot entries output. The number of pairs is arbitrary.
     */
    public static void main(String[] args) throws SAXException,
           ParserConfigurationException, FileNotFoundException, IOException {
        if(args.length < 9) {
            throw new RuntimeException("Please provide the parameters.");
        }

        int i = 0;
        String taxonsFile = args[i++];
        String peptidesFile = args[i++];
        String uniprotEntriesFile = args[i++];
        String refseqCrossReferencesFile = args[i++];
        String ecCrossReferencesFile = args[i++];
        String emblCrossReferencesFile = args[i++];
        String goCrossReferencesFile = args[i++];
        String proteomesFile = args[i++];
        String proteomeCrossReferencesFile = args[i++];

        TaxonList taxonList = TaxonList.loadFromFile(taxonsFile);
        TableWriter writer = new TableWriter(taxonList, peptidesFile,
                uniprotEntriesFile, refseqCrossReferencesFile,
                ecCrossReferencesFile, emblCrossReferencesFile,
                goCrossReferencesFile, proteomesFile,
                proteomeCrossReferencesFile
        );
        SAXParser parser = SAXParserFactory.newInstance().newSAXParser();

        /* Parse each uniprot file. */
        for(; i < args.length; i += 2) {
            String uniprotFile = args[i];
            String uniprotType = args[i+1];
            InputStream uniprotStream = new GZIPInputStream(
                new FileInputStream(uniprotFile)
            );
            UniprotHandler handler = new UniprotHandler(uniprotType);
            handler.addObserver(writer);
            parser.parse(uniprotStream, handler);
            uniprotStream.close();
        }

        writer.close();
    }

}

