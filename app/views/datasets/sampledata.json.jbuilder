json.sample_data @datasets do |dataset|
  json.id dataset.id
  json.environment dataset.environment
  json.reference dataset.reference
  json.url dataset.url
  json.project_website dataset.project_website
end
