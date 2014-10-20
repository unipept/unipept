package org.unipept.tools.commandline;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.sql.Timestamp;
import java.util.List;
import java.util.zip.GZIPInputStream;

import javax.xml.parsers.ParserConfigurationException;
import javax.xml.parsers.SAXParser;
import javax.xml.parsers.SAXParserFactory;

import org.xml.sax.SAXException;

import org.unipept.storage.PeptideLoaderData;
import org.unipept.tools.ProgressWriter;
import org.unipept.xml.UniprotHandler;

/**
 * This script parses uniprot xml files, extracts the protein information and
 * puts the peptides in the database.
 * 
 * BEFORE ADDING PEPTIDES TO THE DATABASE, ALL TABLES ARE TRUNCATED.
 * 
 * The input is expected to be a file containing a list of genbank filenames.
 * 
 * @author Bart Mesuere
 * 
 */
public class PeptideLoader {

    // Objects used
    private final PeptideLoaderData data;
    private final SAXParser xmlParser;

    public PeptideLoader(boolean emptyTheDatabase) throws ParserConfigurationException, SAXException {
        // easy access to the database
        data = new PeptideLoaderData();
        if (emptyTheDatabase) {
            data.emptyAllTables();
        }

        // xml stuff
        xmlParser = SAXParserFactory.newInstance().newSAXParser();
    }

    /**
     * Processes a given xml file.
     *
     * @param file
     *            The path of the xml file to read.
     * @param isSwissprot
     *            Is it a swissprot file?
     */
    private void processFile(String file, boolean isSwissprot) {
        System.err.println(new Timestamp(System.currentTimeMillis()) + " Reading " + file);

        try {
            InputStream in = new GZIPInputStream(new FileInputStream(file));
            UniprotHandler handler = new UniprotHandler(isSwissprot);
            handler.subscribe(data);
            xmlParser.parse(in, handler);
        } catch (SAXException e) {
            System.err.println(new Timestamp(System.currentTimeMillis())
                    + " Something went wrong while parsing");
            e.printStackTrace();
        } catch (IOException e) {
            System.err.println(new Timestamp(System.currentTimeMillis())
                    + " Something went wrong reading " + file);
            e.printStackTrace();
        }
    }

    private void addLineage() {
        System.err.println(new Timestamp(System.currentTimeMillis()) + " Adding lineages...");
        data.emptyLineages();
        // get the taxonIds
        List<Integer> list = data.getUniqueTaxonIds();
        System.err.println(new Timestamp(System.currentTimeMillis()) + " Recalculating "
                + list.size() + " lineages");
        int i = 1;
        for (Integer id : list) {
            if (++i % 100000 == 0) {
                System.err.println(new Timestamp(System.currentTimeMillis()) + " " + i + " done");
            }
            data.addLineage(id);
        }

    }

    public void close() {
        data.close();
    }

    /**
     * This script parses uniprot xml files, extracts the protein information
     * and puts the peptides in the database. The input is expected to be the
     * location of the swissprot and tremble xml files.
     *
     * @param args
     *            the path to the input files
     */
    public static void main(String... args) throws ParserConfigurationException, SAXException {
        // Process input
        if (args.length != 1 && args.length != 2) {
            System.out.println("To load data: java PeptideLoader swissprot.xml.gz trembl.xml.gz");
            System.out.println("To fix lineages: java PeptideLoader lineages");
            System.exit(-1);
        }
        if (args[0].equals("lineages")) {
            // create a new loader object
            PeptideLoader loader = new PeptideLoader(false);
            loader.addLineage();
            loader.close();
        } else {
            // create a new loader object
            PeptideLoader loader = new PeptideLoader(true);

            ProgressWriter.addProgress("Build database - load uniprot", 100);
            ProgressWriter.updateProgress("Build database - load uniprot", 45);

            // process the swissprot input file
            ProgressWriter.addProgress("Swiss-Prot", 536489);
            loader.processFile(args[0], true);
            ProgressWriter.removeProgress("Swiss-Prot");
            ProgressWriter.updateProgress("Build database - load uniprot", 70);

            // process the tremble input file
            //ProgressWriter.addProgress("TrEMBL", 22660469);
            //loader.processFile(args[1], false);
            //ProgressWriter.removeProgress("TrEMBL");
            ProgressWriter.updateProgress("Build database - load uniprot", 90);

            loader.addLineage();
            loader.close();
            ProgressWriter.removeProgress("PeptideLoader");
        }
    }
}
