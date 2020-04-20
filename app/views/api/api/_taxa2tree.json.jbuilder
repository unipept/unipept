json.id item.id
json.name item.name
json.rank item.data['rank']
json.data do
  json.count item.data['count']
  json.self_count item.data['self_count']
end
json.children item.children.each do |child|
  json.partial! partial: 'api/api/taxa2tree', locals: { item: child }
end
