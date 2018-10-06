json.array!(@result) do |k, v|
  json.peptide k
  json.ec v[:ec].sort_by { |value| -value[:proteins] }
  json.partial! partial: 'api/api/pept2go', locals: { data: v[:go] }
end
