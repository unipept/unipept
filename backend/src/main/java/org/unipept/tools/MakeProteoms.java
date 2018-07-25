package org.unipept.tools;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

import javax.json.Json;
import javax.json.JsonArray;
import javax.json.JsonObject;
import javax.json.JsonReader;

import org.unipept.storage.CSV;
import org.unipept.storage.CSV.Writer;

/**
 * Get proteom data from ebi
 */
public class MakeProteoms {

  public static void main(String[] args) throws IOException {
    if (args.length != 2) {
      throw new RuntimeException("Please provide the parameters.");
    }

    CSV.Reader reader = new CSV.Reader(args[0]);
    CSV.Writer writer = new CSV.Writer(args[1]);
    String[] row = null;

    Map<String, Long> proteomIdMap = new HashMap<>();

    while ((row = reader.read()) != null) {
      proteomIdMap.put(row[1], Long.parseLong(row[0]));
      if (proteomIdMap.size() >= 95) {
        performLookup(proteomIdMap, writer);
        proteomIdMap.clear();
      }
    }
    performLookup(proteomIdMap, writer);
    writer.close();
  }

  private static void performLookup(Map<String, Long> proteomIdMap, Writer writer) throws IOException {
    if (!proteomIdMap.isEmpty()) {
      String requested = proteomIdMap.keySet().stream().collect(Collectors.joining("%2C"/* comma */));
      try (
        InputStream is = (new URL("https://www.ebi.ac.uk/proteins/api/proteomes?offset=0&size=-1&upid=" + requested)).openStream(); 
        JsonReader rdr = Json.createReader(is)
      ) {

        JsonArray results = rdr.readArray();

        for (JsonObject obj : results.getValuesAs(JsonObject.class)) {
          String accession = obj.getString("upid", "");
          long origId = proteomIdMap.get(accession);
          parseAndWrite(obj, origId, accession, writer);
        }

      } catch (FileNotFoundException e) {
        // error without stopping
        e.printStackTrace();
      }
    }
  }

  private static void parseAndWrite(JsonObject obj, long id, String accession, CSV.Writer writer) throws IOException {

    if ("viruses".equals(obj.getString("superregnum", null))) {
      return; // Skip viruses
    }

    JsonArray dbRfs = obj.getJsonArray("dbReference");
    String assembly = null;
    if (dbRfs != null) {
      for (JsonObject result : dbRfs.getValuesAs(JsonObject.class)) {
        if ("GCSetAcc".equals(result.getString("type", null))) {
          assembly = result.getString("id", null);
        }
      }
    }
    writer.write(Long.toString(id), accession, obj.getString("name"), obj.getString("strain", null),
        obj.getBoolean("isReferenceProteome") ? "1" : "0", assembly);
  }
}