json.array! @result do |peptide, data|
  json.peptide peptide
  json.total_protein_count data[:total]
  json.partial! partial: 'api/api/pept2go', locals: { data: data[:go] }
end
