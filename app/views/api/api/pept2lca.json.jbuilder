json.array! @result do |peptide, data|
  json.peptide peptide
  json.partial! partial: 'api/api/pept2lca', locals: { data: data }
end
