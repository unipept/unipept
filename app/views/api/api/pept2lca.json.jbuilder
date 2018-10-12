json.array! @input_order do |peptide|
  json.peptide peptide
  seq_index = @equate_il ? peptide.gsub(/I/,'L') : peptide
  json.partial! partial: 'api/api/pept2lca', locals: { data: @result[seq_index] }
end
