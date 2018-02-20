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
            @fa_summary[:go][:data].each do |term, value|
                json.set! term do
                    json.array! value do |k,v|
                        json.code k.code
                        json.namespace k.namespace
                        json.name k.name
                        json.value v
                    end
                end 
            end
        end
    end
    json.ec do
        json.numAnnotatedPeptides @fa_summary[:ec][:numAnnotatedPeptides]
        json.data do 
            json.array! @fa_summary[:ec][:data] do |k,v|
                json.code k.code
                json.name k.name
                json.value v
            end
        end
    end
end