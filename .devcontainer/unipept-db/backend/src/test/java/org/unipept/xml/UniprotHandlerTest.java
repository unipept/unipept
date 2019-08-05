package org.unipept.xml;

import java.io.IOException;
import java.io.InputStream;

import javax.xml.parsers.ParserConfigurationException;
import javax.xml.parsers.SAXParser;
import javax.xml.parsers.SAXParserFactory;

import org.junit.Assert;
import org.junit.Test;
import org.xml.sax.SAXException;

public class UniprotHandlerTest extends Assert {
    private class Stats implements UniprotObserver {
        public int entries;
        public int sequences;
        
        public void handleEntry(UniprotEntry e) {
            entries++;
            sequences++;
        }

        public void close() {
        }
    }
    
    public UniprotHandlerTest() { 
    }

    @Test
    public void testHandlerSwissProt_1() {
        Stats s = new Stats();
        runHandler(new UniprotHandler(5, 50, "swissprot"), s, "../../../uniprot_sprot_1.xml");
        assertEquals(s.entries, 1);
        assertEquals(s.sequences, 1);
    }
    
    @Test
    public void testHandlerSwissProt_3() {
        Stats s = new Stats();
        runHandler(new UniprotHandler(5, 50, "swissprot"), s, "../../../uniprot_sprot_3.xml");
        assertEquals(s.entries, 3);
        assertEquals(s.sequences, 3);
    }
    
    public void runHandler(UniprotHandler handler, UniprotObserver s, String path) {
        try {
            InputStream in = this.getClass().getResourceAsStream(path);
            handler.addObserver(s);
            SAXParser xmlParser = SAXParserFactory.newInstance().newSAXParser();
            xmlParser.parse(in, handler);
        } catch (ParserConfigurationException e) {
            e.printStackTrace();
            assertTrue(false);
        } catch     (SAXException e) {
            e.printStackTrace();
            assertTrue(false);
        } catch (IOException e) {
            e.printStackTrace();
            assertTrue(false);
        }
    }
}
