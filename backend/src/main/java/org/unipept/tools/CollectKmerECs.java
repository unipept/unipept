package org.unipept.tools;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;

public class CollectKmerECs {

    /**
     * Takes a sorted kmer-ec file and combines lines starting with the same
     * kmer, merging the lists of associated EC-number ids.
     * The result is written to stdout.
     */
    public static void main(String[] args) throws IOException {
        if (args.length != 1) {
            throw new RuntimeException("Expected 1 argument: [sorted kmer ec file]");
        }

        Path kmerFile = Paths.get(args[0]);
        Iterator<Line> lines = Files.newBufferedReader(kmerFile)
                .lines()
                .map(Line::new)
                .iterator();


        Line current = lines.next();
        String kmer = current.kmer;
        Set<String> ecs = new HashSet<>(current.ecIds);


        while (lines.hasNext()) {
            current = lines.next();

            // If kmer changed, we can writeout
            if (!kmer.equals(current.kmer)) {
                System.out.println(kmer.concat("\t").concat(String.join(",", ecs)));
                kmer = current.kmer;
                ecs.clear();
            }

            ecs.addAll(current.ecIds);
        }

        // Last writeout
        System.out.println(kmer.concat("\t").concat(String.join(",", ecs)));

    }


    private static class Line {
        String kmer;
        List<String> ecIds;

        Line(String line){
            String[] parts = line.split("\t");
            this.kmer = parts[0];
            this.ecIds = Arrays.asList(parts[1].split(","));
        }
    }

}
