# Load the rails application
require File.expand_path('../application', __FILE__)
require 'csv'
require 'scbi_go'

# Initialize GO graph
file = Rails.root.join('data/goterms/goinfo.obo')
GO_GRAPH = ScbiGo::GeneOntology.new(filename=file.to_s)

# Initialize the rails application
UnipeptWeb::Application.initialize!
