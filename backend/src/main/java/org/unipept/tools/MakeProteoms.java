package org.unipept.tools;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import javax.json.Json;
import javax.json.JsonArray;
import javax.json.JsonObject;
import javax.json.JsonReader;

import org.unipept.storage.CSV;

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
    while ((row = reader.read()) != null) {
      getProteom(Long.parseLong(row[0], 10), row[1], writer);
    }
    writer.close();
  }

  private static void getProteom(long id, String accession, CSV.Writer writer) throws IOException {
    try (InputStream is = (new URL("https://www.ebi.ac.uk/proteins/api/proteomes/" + accession)).openStream();
        JsonReader rdr = Json.createReader(is)) {

      JsonObject obj = rdr.readObject();

      if ("viruses".equals(obj.getString("superregnum", null))) {
        return; // Skip viruses
      }

      parseAndWrite(obj, id, accession, writer);

    } catch (FileNotFoundException e) {
      System.err.println("Not found:" + accession);
    }
  }

  private static void parseAndWrite(JsonObject obj, long id, String accession, CSV.Writer writer) throws IOException {
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