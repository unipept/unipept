json.array!(@result[:ec][:output]) do |k, v|
  json.peptide k
  json.ec  v.sort_by { |_key, value| -value } do |k1, v1|
    json.proteins v1
    json.ec_number_code k1
    if @extra_info
      json.name @result[:ec][:ec_mapping][k1]
    end
  end

  json.partial! partial: 'api/api/pept2go', locals: {
      split: @split,
      go_mapping: @result[:go][:go_mapping],
      extra_info: @extra_info,
      value: @result[:go][:output][k]
  }
end
