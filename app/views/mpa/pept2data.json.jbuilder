json.peptides @peptides do |peptide|
  json.sequence peptide.sequence
  json.lca @equate_il ? peptide.lca_il : peptide.lca
  l = peptide.send(Sequence.lca_t_relation_name(@equate_il)).lineage
  json.lineage(Lineage.ranks.map { |rank| l.send(rank) })
  json.fa do
    json.counts @results_fa[peptide.sequence]['num']
    json.data @results_fa[peptide.sequence]['data']
  end
end
