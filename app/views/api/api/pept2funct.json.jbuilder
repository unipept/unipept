json.array! @input_order do |peptide|
  seq_index = @equate_il ? peptide.gsub(/I/,'L') : peptide
  if @result.key? seq_index
    json.peptide peptide
    json.total_protein_count @result[seq_index][:total]
    json.ec @result[seq_index][:ec].sort_by { |value| -value[:protein_count] }
    json.partial! partial: 'api/api/pept2go', locals: { data: @result[seq_index][:go] }
  end
end
