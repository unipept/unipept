package org.unipept.storage;

import java.io.IOException;
import java.io.BufferedReader;
import java.io.FileReader;

public class CSVReader {

    private BufferedReader buffer;
    private int titleCount;

    public CSVReader(String file) throws IOException {
        buffer = new BufferedReader(new FileReader(file));
        String titles = buffer.readLine(); // Skipping the header
        titleCount = titles.length() - titles.replace("	", "").length();
    }

    public String[] read() throws IOException {
        return buffer.readLine().split("	");
    }

    public void close() throws IOException {
        buffer.close();
    }

}
