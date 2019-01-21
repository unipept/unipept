json.peptide @original_sequence
json.tree @root
json.uniprotEntries @entries.map(&:uniprot_accession_number)

# We do not simply use
# json.fa @fa_summary
# because the keys of the :go:data are complex
json.fa do
  json.counts @fa_summary['num']
  json.data @fa_summary['data']
end
