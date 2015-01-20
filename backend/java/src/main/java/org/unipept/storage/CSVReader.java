package org.unipept.storage;

import java.io.IOException;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.zip.GZIPInputStream;
import java.io.FileInputStream;

public class CSVReader {

    private BufferedReader buffer;

    public CSVReader(String file) throws IOException {
        buffer = new BufferedReader(
                    new InputStreamReader(
                        new GZIPInputStream(
                            new FileInputStream(
                                System.getenv("TABDIR")+"/"+file+".tsv.gz"
                            )
                        )
                    )
                );
        String titles = buffer.readLine(); // Skipping the header
    }

    public String[] read() throws IOException {
        String line = buffer.readLine();
        if(line == null) return null;
        return line.split("	");
    }

    public void close() throws IOException {
        buffer.close();
    }

}
