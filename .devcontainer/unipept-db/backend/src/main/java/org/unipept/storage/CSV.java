package org.unipept.storage;

import java.io.IOException;
import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.util.zip.GZIPInputStream;
import java.util.zip.GZIPOutputStream;
import java.io.FileInputStream;
import java.io.FileOutputStream;

public class CSV {

    private static final int MB4 = 4194304;

    public static class Reader {
        private BufferedReader buffer;

        public Reader(String file) throws IOException {
            buffer = new BufferedReader(
                new InputStreamReader(
                    new FileInputStream(file)
                )
            );
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

    public static class Writer {
        protected BufferedWriter buffer;

        public Writer(String file) throws IOException {
            buffer = new BufferedWriter(
                new OutputStreamWriter(
                    new FileOutputStream(file)
                ), MB4
            );
        }

        public void write(String... values) throws IOException {
            buffer.write(values[0]);
            for(int i = 1; i < values.length; i++) {
                buffer.write("	" + (values[i] == null ? "\\N" : values[i]));
            }
            buffer.newLine();
        }

        public void close() throws IOException {
            buffer.close();
        }
    }

    public static class IndexedWriter extends Writer {
        private long index;
        
        public IndexedWriter(String file) throws IOException {
            super(file);
            index = 0;
        }

        @Override
        public void write(String... values) throws IOException {
            buffer.write(Long.toString(++index));
            for(int i = 0; i < values.length; i++) {
                buffer.write("	" + (values[i] == null ? "\\N" : values[i]));
            }
            buffer.newLine();
        }

        public long index() {
            return index;
        }
    }

    public static String toString(boolean b) {
        return b ? "\1" : "\0";
    }

    public static boolean toBoolean(String b) {
        return b.charAt(0) == (char) 1;
    }

}
