json.peptide @original_sequence
json.tree @root
json.uniprotEntries @entries.map(&:uniprot_accession_number)

# We do not simply use
# json.fa @fa_summary
# because the keys of the :go:data are complex
json.fa do
  json.go do
    json.numAnnotatedPeptides @fa_summary[:go][:numAnnotatedPeptides]
    json.data do
      @fa_summary[:go][:data].each do |namespace, count_map|
        json.set! namespace do
          json.array! count_map do |goterm, count|
            json.code goterm.code
            json.namespace goterm.namespace
            json.name goterm.name
            json.value count
          end
        end
      end
    end
  end
  json.ec do
    json.numAnnotatedPeptides @fa_summary[:ec][:numAnnotatedPeptides]
    json.data do
      json.array! @fa_summary[:ec][:data] do |ecnumber, count|
        json.code ecnumber.code
        json.name ecnumber.name
        json.value count
      end
    end
  end
end
