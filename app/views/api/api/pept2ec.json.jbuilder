json.array!(@result[:output]) do |peptide, value|
  json.peptide peptide
  json.ec value.sort_by { |_key, v| -v } do |k1, v1|
    json.proteins v1
    json.ec_number_code k1

    if @extra_info
      json.name @result[:ec_mapping][k1]
    end
  end
end
