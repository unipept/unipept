Apipie.configure do |config|
  config.app_name                = "Unipept API"
  config.api_base_url            = "/api"
  config.doc_base_url            = "/apidoc"
  config.reload_controllers      = Rails.env.development?
  config.validate                = false
  config.markup                  = Apipie::Markup::Markdown.new
  # where is your API defined?
  config.api_controllers_matcher = "#{Rails.root}/app/controllers/api/*.rb"
  config.layout                  = "application"
  config.default_version         = "v1"
  config.app_info                = <<-EOS
  <h1 class="api-title">Unipept API documentation <small>v1</small></h1>
  <p class="lead">
    Unipept offers most of its peptide analysis features as a web service. This page contains the documentation to use these services.
  </p>

  There are four basic methods:
  <dl class="dl-horizontal">
  <dt>pept2prot</dt>
      <dd>Returns a list of Uniprot entries containing a given tryptic peptide</dd>
  <dt>pept2taxa</dt>
      <dd>Returns a list of taxa retrieved from the Uniprot entries containing a given tryptic peptide</dd>
  <dt>pept2lca</dt>
      <dd>Returns the taxonomic lowest common ancestor for a given tryptic peptide</dd>
  <dt>taxa2lca</dt>
      <dd>Returns the lowest common ancestor for a given list of taxon id's</dd>
  </dl>
  Click the corresponding links below for more information about how to access them, a description of the paramters they take and a list of examples.
  EOS
end
