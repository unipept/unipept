package org.unipept.tools;

import java.io.IOException;
import java.security.Principal;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;
import org.unipept.storage.CSV;

public class FunctionAnalysisPeptides {

    public static void main(String[] args) throws IOException {
        if (args.length != 2) {
            throw new RuntimeException("Please provide the parameters.");
        }

        String inputPepts = args[0];
        String peptidesList = args[1];

        CSV.Reader reader = new CSV.Reader(inputPepts);
        CSV.Writer writer = new CSV.Writer(peptidesList);

        Map<String, Integer> m = new HashMap<>();

        String[] row = null;
        String curPept = null;
        int numProt = 0;
        int numAnnotatedGO = 0;
        int numAnnotatedEC = 0;
        int done = 0;
        while ((row = reader.read()) != null) {

            if (!row[0].equals(curPept)) {
                if (curPept != null) {
                    if (!m.isEmpty()) {
                        writer.write(curPept, extracted(m, numProt, numAnnotatedGO, numAnnotatedEC));
                    }
                }
                m.clear();
                numProt = 0;
                numAnnotatedGO = 0;
                numAnnotatedEC = 0;
                curPept = row[0];
            }
            numProt++;

            if (row.length > 1) {
                String[] terms = row[1].split(";");
                boolean hasEC = false;
                boolean hasGO = false;
                for (String term : terms) {
                    hasGO |= term.startsWith("GO");
                    hasEC |= term.startsWith("EC");
                    m.put(term, m.getOrDefault(term, 0) + 1);
                }
                numAnnotatedGO += hasGO ? 1 : 0;
                numAnnotatedEC += hasEC ? 1 : 0;
            }
            done++;
            if (done % 1000000 == 0) {
                System.out.println(done);
            }
        }
        if (!m.isEmpty()) {
            writer.write(curPept, extracted(m, numProt, numAnnotatedGO, numAnnotatedEC));
        }
        writer.close();
    }

    /**
     * 
     * Output of the following form:
     * {
     *   "num": {
     *     "all": 1,
     *     "EC": 1,
     *     "GO": 1
     *   },
     *   "data": {
     *     "GO:0016569": 1,
     *     "GO:0006281": 1,
     *     "GO:0000781": 1,
     *     "EC:2.7.11.1": 1,
     *     "GO:0004674": 1,
     *     "GO:0005634": 1,
     *     "GO:0005524": 1,
     *     "GO:0016301": 1
     *   }
     * }
     * 
     * But without spacing:
     * {"num":{"all":1,"EC":1,"GO":1},"data":{"GO:0016569":1,"GO:0006281":1,"GO:0000781":1,"2.7.11.1":1,"GO:0004674":1,"GO:0005634":1,"GO:0005524":1,"GO:0016301":1}}
     */
    private static String extracted(Map<String, Integer> m, int numProt, int numAnnotatedGO, int numAnnotatedEC) {
        StringBuilder sb = new StringBuilder();
        sb.append("{\"num\":{\"all\":");
        sb.append(numProt);
        sb.append(",\"EC\":");
        sb.append(numAnnotatedEC);
        sb.append(",\"GO\":");
        sb.append(numAnnotatedGO);
        sb.append("},\"data\":{");
        sb.append(m.entrySet().stream().map(e -> {
            return '"' + e.getKey() + "\":" + e.getValue();
        }).collect(Collectors.joining(",")));
        sb.append("}}");
        return sb.toString();
    }

}
