json.array! @lineages do |lineage|
    json.id lineage.taxon_id
    json.lineage(Lineage.ranks.map { |rank| lineage.send(rank) })
end
  