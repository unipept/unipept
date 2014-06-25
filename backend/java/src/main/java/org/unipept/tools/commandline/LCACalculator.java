package org.unipept.tools.commandline;

import java.io.*;
import java.sql.Timestamp;
import java.util.*;

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
                .forEach(line -> {
                    String[] elements = SEPARATOR.split(line);

                    int key = Integer.parseInt(elements[0]);
                    int[] lineage = Arrays.stream(elements)
                            .mapToInt(s -> s.equals("NULL") ? 0 : Integer.parseInt(s))
                            .toArray();

                    taxonomyMap.put(key, lineage);
                });

        int max = taxonomyMap.keySet().stream().max(Integer::compare).get();
        taxonomy = new int[max + 1][];
        taxonomyMap.keySet().stream().forEach(key -> taxonomy[key] = taxonomyMap.get(key));
    }

    public static void calculateLCAs(String file) throws FileNotFoundException {
        Scanner sc = new Scanner(new File(file));
        sc.nextLine(); // skip header

        int count = 0;

        int currentSequence = -1;
        Collection<Integer> taxa = new ArrayList<>();
        while (sc.hasNext()) {
            count++;
            if (count % 1000000 == 0) {
                System.err.println(new Timestamp(System.currentTimeMillis()) + ": " + count);
            }
            String[] split = SEPARATOR.split(sc.nextLine());
            int sequenceId = Integer.parseInt(split[0]);
            int taxonId = Integer.parseInt(split[1]);

            if (sequenceId != currentSequence) {
                if (currentSequence != -1) {
                    int lca = 1;
                    int[][] lineages = taxa.stream()
                            .map(t -> taxonomy[t])
                            .filter(l -> l != null)
                            .toArray(int[][]::new);
                    for (int rank = 0; rank < lineages[0].length; rank++) {
                        final int finalRank = rank;
                        int[] current = Arrays.stream(lineages)
                                .mapToInt(l -> l[finalRank])
                                .filter(i -> i > 0)
                                .toArray();
                        if (current.length > 1) {
                            break;
                        }
                        if (current.length > 0 && current[0] != 0) {
                            lca = current[0];
                        }
                    }
                    //System.out.println(currentSequence + "," + lca);
                }

                currentSequence = sequenceId;
                taxa.clear();
            }

            taxa.add(taxonId);
        }
    }
}
