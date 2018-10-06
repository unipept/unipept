json.array! @result do |peptide, data|
  json.peptide peptide
  json.ec data[:ec].sort_by { |v| -v[:proteins] }
end
