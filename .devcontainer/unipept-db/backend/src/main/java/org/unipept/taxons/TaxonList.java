package org.unipept.taxons;

import java.util.ArrayList;
import java.util.regex.Pattern;
import java.io.FileReader;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.FileNotFoundException;

import org.unipept.taxons.Taxon;
import org.unipept.storage.CSV;

public class TaxonList extends ArrayList<Taxon> {

    private static final Pattern PATTERN = Pattern.compile("\\|");

    public TaxonList() {
        super();
    }

    public static TaxonList loadFromFile(String filename) throws IOException {
        TaxonList tl = new TaxonList();
        CSV.Reader reader = new CSV.Reader(filename);
        String[] row = null;
        while((row = reader.read()) != null) {
            int id = Integer.parseInt(row[0]);
            Taxon t = new Taxon(
                row[1],
                Taxon.Rank.fromString(row[2]),
                Integer.parseInt(row[3])
            );
            if(! CSV.toBoolean(row[4])) t.invalidate();
            while(tl.size() <= id) tl.add(null);
            tl.set(id, t);
        }
        return tl;
    }

    public static TaxonList parseDumps(String namesFile, String nodesFile)
    throws FileNotFoundException, IOException {
        TaxonList tl = new TaxonList();
        BufferedReader names = new BufferedReader(new FileReader(namesFile));
        BufferedReader nodes = new BufferedReader(new FileReader(nodesFile));

        String nodeline = null;
        while((nodeline = nodes.readLine()) != null) {
            String[] noderow = PATTERN.split(nodeline);
            int taxon_id = Integer.parseInt(noderow[0].trim());
            int parent_id = Integer.parseInt(noderow[1].trim());
            Taxon.Rank rank = Taxon.Rank.fromString(noderow[2].trim());

            String nameline = null;
            String name = null, clas = null;
            int taxon_id2 = -1;
            while(!"scientific name".equals(clas) && (nameline = names.readLine()) != null) {
                String[] namerow = PATTERN.split(nameline);
                taxon_id2 = Integer.parseInt(namerow[0].trim());
                name = namerow[1].trim();
                clas = namerow[3].trim();
            }

            if("scientific name".equals(clas) && taxon_id == taxon_id2) {
                while(tl.size() <= taxon_id) tl.add(null);
                tl.set(taxon_id, new Taxon(name, rank, parent_id));
            } else {
                throw new RuntimeException("Taxon " + taxon_id +
                        " did not have a scientific name.");
            }
        }

        names.close();
        nodes.close();

        return tl;

    }

    public void invalidate() {
        for(int i = 0; i < size(); i++) validate(i);
    }

    private boolean validate(int taxon_id) {
        Taxon t = get(taxon_id);

        if(t == null) return false;

        if(! t.valid()
        || (t.rank == Taxon.Rank.SPECIES
          && (
            (t.name.matches(".*\\d.*") && !t.name.contains("virus"))
            || t.name.endsWith(" sp.")
            || t.name.endsWith(" genomosp.")
          )
        )
        || t.name.contains("enrichment culture")
        || t.name.contains("mixed culture")
        || t.name.contains("uncultured")
        || t.name.contains("unidentified")
        || t.name.contains("unspecified")
        || t.name.contains("undetermined")
        || t.name.contains("sample")
        || t.name.endsWith("metagenome")
        || t.name.endsWith("library")
        || taxon_id == 28384
        || taxon_id == 48479) {
            t.invalidate();
            return false;
        }

        if(taxon_id == 1) return true;

        if(! validate(t.parent)) t.invalidate();
        return t.valid();
    }

    public void writeToFile(String filename) throws IOException {
        CSV.Writer writer = new CSV.Writer(filename);
        for(int i = 0; i < size(); i++) {
            Taxon t = get(i);
            if(t != null) writer.write(Integer.toString(i), t.name,
                    t.rank.toString(), Integer.toString(t.parent),
                    CSV.toString(t.valid()));
        }
        writer.close();
    }

    public void writeLineagesToFile(String filename) throws IOException {
        CSV.Writer writer = new CSV.Writer(filename);
        int nranks = Taxon.Rank.values.length;

        for(int i = 0; i < size(); i++) {
            Taxon t = get(i);
            if(t == null) continue;

            // +1 want - no_rank + lineage_id + taxon_id
            String[] lineage = new String[nranks];
            lineage[0] = Integer.toString(i);

            int tid = rankedAncestor(i);
            t = get(tid);
            boolean valid = t.valid();
            for(int j = nranks - 1; j >= 1; j--) {
                if(j > t.rank.index()) {
                    lineage[j] = valid ? null : "-1";
                } else {
                    valid = t.valid();
                    lineage[j] = Integer.toString((valid ? 1 : -1) * tid);
                    tid = rankedAncestor(t.parent);
                    t = get(tid);
                }
            }

            writer.write(lineage);
        }

        writer.close();
    }

    private int rankedAncestor(int tid) {
        Taxon t = get(tid);
        int pid = -1;
        while(t != null && tid != pid && t.rank == Taxon.Rank.NO_RANK) {
            pid = tid;
            tid = t.parent;
            t = get(tid);
        }
        if(t != null) return tid;
        return 1; // only used in case a taxon is no descendant of root
    }

}
