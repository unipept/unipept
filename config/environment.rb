# Load the rails application
require_relative 'application'
require 'csv'
require 'scbi_go'

# Initialize the rails application
UnipeptWeb::Application.initialize!

# Initialize GO graph
file = Rails.root.join('goinfo.obo')
GO_GRAPH = ScbiGo::GeneOntology.new(filename=file.to_s)

