json.sample_data @datasets do |dataset|
  json.id dataset.id
  json.environment dataset.environment
  json.reference dataset.reference
  json.url dataset.url
  json.project_website dataset.project_website
  json.datasets dataset.dataset_items.map do |dataset_item|
    json.name dataset_item.name
    json.data dataset_item.data.gsub(/\r/, '').split("\n")
    json.order dataset_item.order
  end
end
