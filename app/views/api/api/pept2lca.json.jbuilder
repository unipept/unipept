json.array! @input_order do |peptide|
  seq_index = @equate_il ? peptide.tr('I', 'L') : peptide
  if @result.key? seq_index
    json.peptide peptide
    json.partial! partial: 'api/api/pept2lca', locals: { data: @result[seq_index] }
  end
end
