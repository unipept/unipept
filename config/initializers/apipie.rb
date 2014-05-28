Apipie.configure do |config|
  config.app_name                = "Unipept"
  config.api_base_url            = "/api"
  config.doc_base_url            = "/apidoc"
  config.reload_controllers      = Rails.env.development?
  config.validate                = false
  # where is your API defined?
  config.api_controllers_matcher = "#{Rails.root}/app/controllers/api/*.rb"
end
