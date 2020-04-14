json.lca @lca_taxon ? @lca_taxon.id : -1
json.common_lineage(@common_lineage.map(&:id))
json.proteins @entries do |entry|
  json.uniprotAccessionId entry.uniprot_accession_number
  json.name entry.name
  json.organism entry.taxon_id
  json.ecNumbers(entry.ec_cross_references.map(&:ec_number_code))
  json.goTerms(entry.go_cross_references.map(&:go_term_code))
  json.interproEntries(entry.interpro_cross_references.map(&:interpro_entry_code))
end
