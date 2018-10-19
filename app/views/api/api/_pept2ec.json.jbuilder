json.total_protein_count @result[seq_index][:total]
json.ec @result[seq_index][:ec].sort_by { |v| -v[:protein_count] }
