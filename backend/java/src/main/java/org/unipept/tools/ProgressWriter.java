package org.unipept.tools;

import java.io.FileNotFoundException;
import java.io.PrintWriter;
import java.util.HashMap;

public final class ProgressWriter {

    private static final String FILE = "public/progress";
    private static final HashMap<String, Integer> MAX = new HashMap<String, Integer>();
    private static final HashMap<String, Integer> CURRENT = new HashMap<String, Integer>();

    private ProgressWriter() {
    }

    public static void addProgress(String name, int max) {
        MAX.put(name, max);
        CURRENT.put(name, 0);
        write();
    }

    public static void updateProgress(String name, int current) {
        CURRENT.put(name, current);
        write();
    }

    public static void removeProgress(String name) {
        MAX.remove(name);
        CURRENT.remove(name);
        write();
    }

    private static void write() {
        try {
            PrintWriter out = new PrintWriter(FILE);
            for (String key : MAX.keySet()) {
                out.println(key + '#' + (100.0 * CURRENT.get(key) / MAX.get(key)));
            }
            out.close();
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        }
    }

}
