package org.unipept.tools.commandline;

import java.io.*;
import java.util.Arrays;
import java.util.HashMap;

/**
 * This script calculates all lowest common ancestors
 *
 * @author Bart Mesuere
 *
 */
public class LCACalculator {

    private static int[][] taxonomy;

    public static void buildTaxonomy(String file) throws FileNotFoundException {
        HashMap<Integer, int[]> taxonomyMap = new HashMap<>();
        InputStream is = new FileInputStream(new File(file));
        BufferedReader br = new BufferedReader(new InputStreamReader(is));

        br.lines()
                .skip(1)
                .forEach((line) -> {
                    String[] elements = line.split(",");

                    int key = Integer.parseInt(elements[0]);
                    int[] lineage = Arrays.stream(elements)
                            .mapToInt((s) -> s.equals("NULL") ? 0 : Integer.parseInt(s))
                            .toArray();

                    taxonomyMap.put(key, lineage);
                });

        int max = taxonomyMap.keySet().stream().mapToInt(x -> x).max().getAsInt();
        taxonomy = new int[max + 1][];
        taxonomyMap.keySet().stream().forEach(key -> taxonomy[key] = taxonomyMap.get(key));
    }
}
