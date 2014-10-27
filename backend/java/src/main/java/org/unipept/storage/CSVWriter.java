package org.unipept.storage;

import java.io.IOException;
import java.io.BufferedWriter;
import java.io.FileWriter;

public class CSVWriter {

    private BufferedWriter buffer;
    private int index = 0;

    public CSVWriter(String file, String... titles) throws IOException {
        buffer = new BufferedWriter(new FileWriter(file));
        buffer.write("id");
        for(int i = 0; i < titles.length; i++) {
            buffer.write("	" + titles[i].toString());
        }
        buffer.newLine();
    }

    public int write(String... values) throws IOException {
        buffer.write(Integer.toString(++index));
        for(int i = 0; i < values.length; i++) {
            buffer.write("	" + values[i]);
        }
        buffer.newLine();
        return index;
    }

    public void close() throws IOException {
        buffer.flush();
        buffer.close();
    }

}
