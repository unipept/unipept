json.array! @result do |peptide, data|
  json.peptide peptide
  json.total_protein_count data[:total]
  json.ec data[:ec].sort_by { |v| -v[:protein_count] }
end
