package org.unipept.storage;

import java.io.IOException;
import java.io.BufferedWriter;
import java.util.zip.GZIPOutputStream;
import java.io.FileOutputStream;
import java.io.OutputStreamWriter;

public class CSVWriter {

    private BufferedWriter buffer;
    private int index = 0;

    public CSVWriter(String file) throws IOException {
        buffer = new BufferedWriter(
                    new OutputStreamWriter(
                        new GZIPOutputStream(
                            new FileOutputStream(
                                System.getenv("TABDIR")+"/"+file+".tsv.gz"
                            )
                        )
                    )
                );
    }

    public int write(String... values) throws IOException {
        buffer.write(Integer.toString(++index));
        for(int i = 0; i < values.length; i++) {
            buffer.write("	" + (values[i] == null ? "\\N" : values[i]));
        }
        buffer.newLine();
        return index;
    }

    public void close() throws IOException {
        buffer.flush();
        buffer.close();
    }

}
