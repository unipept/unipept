package org.unipept.tools;

import java.io.InputStream;
import java.io.IOException;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.util.zip.GZIPInputStream;
import java.util.List;
import java.util.ArrayList;

import javax.xml.parsers.SAXParser;
import javax.xml.parsers.SAXParserFactory;
import javax.xml.parsers.ParserConfigurationException;

import org.xml.sax.SAXException;

import com.beust.jcommander.Parameter;
import com.beust.jcommander.JCommander;

import org.unipept.xml.UniprotHandler;
import org.unipept.taxons.TaxonList;
import org.unipept.storage.TableWriter;

public class TaxonsUniprots2Tables {

    @Parameter(                           description="Files to be parsed")                   public List<String> files  = new ArrayList<>();
    @Parameter(names="--peptide-min",    description="Minimum peptide length")                public int peptideMin;
    @Parameter(names="--peptide-max",    description="Maximum peptide length")                public int peptideMax;
    @Parameter(names="--taxons",          description="Taxons TSV input file")                public String taxonsFile;
    @Parameter(names="--peptides",        description="Peptides TSV output file")             public String peptidesFile;
    @Parameter(names="--uniprot-entries", description="Uniprot entries TSV output file")      public String uniprotEntriesFile;
    @Parameter(names="--refseq",          description="RefSeq references TSV output file")    public String refseqCrossReferencesFile;
    @Parameter(names="--ec",              description="EC references TSV output file")        public String ecCrossReferencesFile;
    @Parameter(names="--embl",            description="EMBL references TSV output file")      public String emblCrossReferencesFile;
    @Parameter(names="--go",              description="GO references TSV output file")        public String goCrossReferencesFile;
    @Parameter(names="--proteomes",       description="Proteomes TSV output file")            public String proteomesFile;
    @Parameter(names="--proteomes-ref",   description="Proteomes references TSV output file") public String proteomeCrossReferencesFile;

    /**
     * Parse the uniprot xml files into TSV tables.
     *
     * The first parameter is a taxon file, as written by NamesNodes2Taxons. The
     * next 8 parameters are the output files, all in TSV format. In order, they
     * are: the peptides, the uniprot entries, the RefSeq cross,references, the 
     * EC cross references, the EMBL cross references, the GO cross references,
     * the proteomes and the proteome cross references.
     *
     * The rest of the parameters comes in pairs. Each pair is a uniprot xml
     * file to parse and the "type" the entries parsed from this file should get
     * in the UniProt entries output. The number of pairs is flexible.
     */
    public static void main(String[] args) throws SAXException,
           ParserConfigurationException, FileNotFoundException, IOException {
        TaxonsUniprots2Tables main = new TaxonsUniprots2Tables();
        new JCommander(main, args);

        TableWriter writer = new TableWriter(main);
        SAXParser parser = SAXParserFactory.newInstance().newSAXParser();

        /* Parse each uniprot file. */
        for(String inputfile : main.files) {
            String uniprotFile = inputfile.split("=")[1];
            String uniprotType = inputfile.split("=")[0];
            InputStream uniprotStream = new FileInputStream(uniprotFile);
            UniprotHandler handler = new UniprotHandler(main.peptideMin, main.peptideMax, uniprotType);
            handler.addObserver(writer);
            parser.parse(uniprotStream, handler);
            uniprotStream.close();
        }

        writer.close();
    }

}

