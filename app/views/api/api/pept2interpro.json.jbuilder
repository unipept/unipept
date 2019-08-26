json.array! @input_order do |peptide|
  seq_index = @equate_il ? peptide.tr('I', 'L') : peptide
  if @result.key? seq_index
    json.peptide peptide
    json.total_protein_count @result[seq_index][:total]
    json.ipr @result[seq_index][:ipr].sort_by { |v| -v[:protein_count] }
  end
end
