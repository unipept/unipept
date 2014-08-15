Apipie.configure do |config|
  config.app_name                = "Unipept API"
  config.api_base_url            = "/api"
  config.doc_base_url            = "/apidoc"
  config.reload_controllers      = Rails.env.development?
  config.validate                = false
  # where is your API defined?
  config.api_controllers_matcher = "#{Rails.root}/app/controllers/api/*.rb"
  config.layout                  = "application"
  config.default_version         = "v1"
  config.app_info                = "This page gives an overview of the Unipept API."
  config.markup                  = Apipie::Markup::Markdown.new
end
