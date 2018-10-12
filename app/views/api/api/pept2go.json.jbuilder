json.array! @input_order do |peptide|
  json.peptide peptide
  seq_index = @equate_il ? peptide.gsub(/I/,'L') : peptide
  json.total_protein_count @result[seq_index][:total]
  json.partial! partial: 'api/api/pept2go', locals: { data: @result[seq_index][:go] }
end
