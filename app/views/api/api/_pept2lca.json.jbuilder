if data
  json.taxon_id data.id
  json.taxon_name data.name
  json.taxon_rank data.rank

  if @extra_info
    lineage_info(data.lineage, @names).each do |key, value|
      json.set!(key, value)
    end
  end
end
