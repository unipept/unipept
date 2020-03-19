json.array! @taxa do |taxon|
  json.id taxon.id
  json.name taxon.name
  json.rank taxon.rank
  json.lineage(Lineage.ranks.map { |rank| taxon.lineage.send(rank) })
end
