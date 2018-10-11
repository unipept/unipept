json.array! @result do |peptide, data|
  json.peptide peptide
  json.total data[:total]
  json.partial! partial: 'api/api/pept2go', locals: { data: data[:go] }
end
