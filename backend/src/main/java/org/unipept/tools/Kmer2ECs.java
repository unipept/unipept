package org.unipept.tools;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.stream.Collectors;

public class Kmer2ECs {

    public static void main(String[] args) throws IOException {
        if(args.length != 4){
            throw new RuntimeException("Expected 4 arguments: [kmer length] [EC file] [EC crossref file] [Uniprot file]");
        }
        int k = Integer.parseInt(args[0]);
        Path ecFile = Paths.get(args[1]);
        Path crossrefFile = Paths.get(args[2]);
        Path uniprotFile = Paths.get(args[3]);

        System.err.println("Mapping EC numbers to EC ids");
        Map<String, String> ecIds = Files.lines(ecFile)
                .map(s -> s.split("\t"))
                .collect(Collectors.toMap(
                        (String[] s) -> s[1], // EC Number
                        (String[] s) -> s[0] // ID
                ));

        System.err.println("Mapping sequences to EC ids");
        Map<String, Set<String>> sequenceECs = Files.lines(crossrefFile)
                .map(s -> s.split("\t"))
                .collect(Collectors.toMap(
                        (String[] s) -> s[1], // Uniprot ID
                        (String[] s) -> new HashSet<>(Collections.singleton(ecIds.get(s[2]))), // EC id
                        (Set<String> s1, Set<String> s2) -> { // Merge sets with same Uniprot ID
                            s1.addAll(s2);
                            return s1;
                        }
                ));

        System.err.println("Writing kmers and their EC ids");
        Files.lines(uniprotFile)
                .parallel()
                .forEach(line -> {

                    String[] parts = line.split("\t");
                    Set<String> ecs = sequenceECs.get(parts[0]);
                    if(ecs != null && !ecs.isEmpty()){

                        String ecsString = String.join(",", ecs);
                        String sequence = parts[6];
                        int length = sequence.length();
                        StringBuilder sb = new StringBuilder();
                        for (int i = 0; i < length - k + 1; i++) {
                            String kmer = sequence.substring(i, i + k);
                            sb.append(kmer);
                            sb.append('\t');
                            sb.append(ecsString);
                            sb.append('\n');
                        }
                        System.out.print(sb.toString());
                    }
                });
    }

}
