json.peptides do
  @peptides.each do |sequence|
    json.set! sequence.sequence do
      json.counts @results_fa[sequence.sequence]['num']
      json.data @results_fa[sequence.sequence]['data']
    end
  end
end
