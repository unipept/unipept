json.array! @input_order do |peptide|
  seq_index = @equate_il ? peptide.gsub(/I/,'L') : peptide
  json.peptide peptide
  if @result.key? seq_index
    json.total_protein_count @result[seq_index][:total]
    json.ec @result[seq_index][:ec].sort_by { |v| -v[:protein_count] }
  else
    json.total_protein_count 0
    json.ec []
  end
end
