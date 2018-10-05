json.array! @result[:output] do |peptide, value|
  json.peptide peptide
  json.partial! partial: 'api/api/pept2go', locals: {
      split: @split,
      go_mapping: @result[:go_mapping],
      extra_info: @extra_info,
      value: value
  }
end
