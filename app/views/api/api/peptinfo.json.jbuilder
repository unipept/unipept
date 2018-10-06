json.array! @result do |peptide, data|
  json.peptide peptide
  json.ec data[:ec].sort_by { |value| -value[:proteins] }
  json.partial! partial: 'api/api/pept2go', locals: { data: data[:go] }
  json.partial! partial: 'api/api/pept2lca', locals: { data: data[:lca] }
end
