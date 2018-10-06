json.array! @input_order do |k|
  seq_index = @equate_il ? k.gsub(/I/,'L') : k
  p = @result[seq_index]

  json.peptide k
  json.taxon_id p.id
  json.taxon_name p.name
  json.taxon_rank p.rank

  if @extra_info
    lineage_info(p.lineage, @names).each do |key, value|
      json.set!(key, value)
    end
  end
end
