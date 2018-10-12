json.array! @input_order do |peptide|
  json.peptide peptide
  seq_index = @equate_il ? peptide.gsub(/I/,'L') : peptide
  json.total_protein_count @result[seq_index][:total]
  json.ec @result[seq_index][:ec].sort_by { |v| -v[:protein_count] }
end
