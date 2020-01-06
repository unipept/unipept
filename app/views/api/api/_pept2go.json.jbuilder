if @domains
  json.go data.each do |k, v|
    json.set!(k, v.sort_by { |v1| -v1[:protein_count] })
  end
else
  json.go(data.sort_by { |v| -v[:protein_count] })
end
