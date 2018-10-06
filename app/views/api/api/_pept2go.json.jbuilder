if @split
  json.go data.each do |k, v|
    json.set!(k, v.sort_by { |v1| -v1[:proteins] })
  end
else
  json.go data.sort_by { |v| -v[:proteins] }
end
