json.array!(@result[:output]) do |peptide, value|
  json.peptide peptide
  if @split
    json.go do
      json.biological_process value["biological process"].sort_by { |v| -v[:proteins] } do |v|
        json.proteins v[:proteins]
        json.go_term_code v[:go_term_code]
        json.name v[:name]
      end

      json.molecular_function value["molecular function"].sort_by { |v| -v[:proteins] } do |v|
        json.proteins v[:proteins]
        json.go_term_code v[:go_term_code]
        json.name v[:name]
      end

      json.cellular_component value["cellular component"].sort_by { |v| -v[:proteins] } do |v|
        json.proteins v[:proteins]
        json.go_term_code v[:go_term_code]
        json.name v[:name]
      end
    end
  else
    json.go value.sort_by { |_key, v| -v } do |k1, v1|
      json.proteins v1
      json.go_term_code k1
      if @extra_info
        json.name @result[:go_mapping][k1].name
      end
    end
  end
end
