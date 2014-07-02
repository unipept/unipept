package org.unipept.tools.commandline;

import java.io.*;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.HashMap;
import java.util.regex.Pattern;
import java.util.zip.GZIPInputStream;

public class LCACalculator {

    public static final int GENUS = 20;
    public static final int SPECIES = 24;
    public static final int RANKS = 28;
    private static final Pattern SEPARATOR = Pattern.compile("\t");
    private int[][] taxonomy;
    private final Writer writer;

    public LCACalculator(String taxonomyFile, String outputFile) throws IOException {
        writer = new BufferedWriter(new OutputStreamWriter(new FileOutputStream(outputFile), "utf-8"));
        buildTaxonomy(taxonomyFile);
    }

    private void buildTaxonomy(String file) throws FileNotFoundException {
        HashMap<Integer, int[]> taxonomyMap = new HashMap<>();
        InputStream is = new FileInputStream(new File(file));
        BufferedReader br = new BufferedReader(new InputStreamReader(is));

        br.lines()
                .skip(1) // skip header
                .forEach(line -> {
                    String[] elements = SEPARATOR.split(line, 29);

                    int key = Integer.parseInt(elements[0]);
                    int[] lineage = Arrays.stream(elements)
                            .skip(1)// skip taxonId
                            .mapToInt(s -> s.equals("NULL") ? 0 : Integer.parseInt(s))
                            .toArray();

                    taxonomyMap.put(key, lineage);
                });

        int max = taxonomyMap.keySet().stream().max(Integer::compare).get();
        taxonomy = new int[max + 1][];
        taxonomyMap.keySet().stream().forEach(key -> taxonomy[key] = taxonomyMap.get(key));
    }

    public void calculateLCAs(String file) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(new GZIPInputStream(new FileInputStream(file))), 67108864);
        br.readLine(); // skip header

        int count = 0;
        int currentSequence = -1;
        Collection<Integer> taxa = new ArrayList<>();
        String line;
        while ((line = br.readLine()) != null) {
            count++;
            if (count % 10000000 == 0) {
                System.err.println(new Timestamp(System.currentTimeMillis()) + ": " + count);
            }

            // outperforms split by at least 20%
            int t = line.indexOf('\t');
            int sequenceId = Integer.parseInt(line.substring(0, t));
            int taxonId = Integer.parseInt(line.substring(t + 1));

            if (sequenceId != currentSequence) {
                if (currentSequence != -1) {
                    handleLCA(currentSequence, calculateLCA(taxa));
                }

                currentSequence = sequenceId;
                taxa.clear();
            }

            taxa.add(taxonId);
        }
        handleLCA(currentSequence, calculateLCA(taxa));
    }

    private int calculateLCA(Collection<Integer> taxa) {
        int lca = 1;
        int[][] lineages = taxa.stream()
                .map(t -> taxonomy[t])
                .filter(l -> l != null)
                .toArray(int[][]::new);
        for (int rank = 0; rank < RANKS; rank++) {
            final int finalRank = rank;
            final int[] val = {-1};
            boolean allMatch = Arrays.stream(lineages)
                    .mapToInt(l -> l[finalRank])
                    .filter(i -> finalRank == GENUS || finalRank == SPECIES ? i > 0 : i >= 0)
                    .peek(i -> val[0] = val[0] == -1 ? i : val[0])
                    .allMatch(i -> i == val[0]);

            if (val[0] != -1) {
                if (!allMatch) {
                    break;
                }
                if (val[0] != 0) {
                    lca = val[0];
                }
            }
        }
        return lca;
    }

    private void handleLCA(int sequenceId, int lca) {
        try {
            writer.write(sequenceId + "\t" + lca + '\n');
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    /**
     * first argument should be the lineages in tsv format with a header row. Create by running:
     * $ echo "select * from lineages;" | mysql -u unipept -p unipept > lineages.tsv
     * <p/>
     * second argument should be the peptides in gzip'ed tsv format with a header row. Create by running:
     * $ echo "select sequence_id, taxon_id from peptides left join uniprot_entries on peptides.uniprot_entry_id = uniprot_entries.id;" | \n
     * mysql -u unipept -p unipept -q | sort -S 50% --parallel=12 -k1n > sequences.tsv
     * <p/>
     * third argument should be the filename of the output file
     *
     * @param args
     */
    public static void main(String... args) {
        try {
            System.err.println(new Timestamp(System.currentTimeMillis()) + ": reading taxonomy");
            LCACalculator l = new LCACalculator(args[0], args[2]);
            System.err.println(new Timestamp(System.currentTimeMillis()) + ": reading sequences");
            l.calculateLCAs(args[1]);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}