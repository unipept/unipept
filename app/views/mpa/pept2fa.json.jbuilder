json.peptides @peptides do |sequence|
  json.sequence sequence.sequence
  json.numPeptides @results_fa[sequence.sequence][:numPeptides]
  json.go do
    json.numAnnotatedPeptides @results_fa[sequence.sequence][:go][:numAnnotatedPeptides]
    json.data do
      @results_fa[sequence.sequence][:go][:data].each do |namespace, count_map|
        json.set! namespace do
          json.array! count_map do |goterm, count|
            json.code goterm.code
            json.value count
          end
        end
      end
    end
  end

  json.ec do
    json.numAnnotatedPeptides @results_fa[sequence.sequence][:ec][:numAnnotatedPeptides]
    json.data do
      json.array! @results_fa[sequence.sequence][:ec][:data] do |ecnumber, count|
        json.code ecnumber.code
        json.value count
      end
    end
  end
end
