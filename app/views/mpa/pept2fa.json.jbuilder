json.peptides @results_go do |sequence,res|
  json.sequence sequence
  json.go res
  json.ec @results_ec[sequence]
end