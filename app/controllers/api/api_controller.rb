class Api::ApiController < ApplicationController

  respond_to :json

  before_filter :set_params, only: [:single, :lca]

  def set_params
    @sequences = params[:sequences].map(&:chomp)
    @equate_il = (!params[:equate_il].blank? && params[:equate_il] == 'true')
    @full_lineage = (!params[:full_lineage].blank? && params[:full_lineage] == 'true')
  end

  def single
    sequences = @sequences.map { |s| Sequence.single_search(s.upcase, @equate_il) }
    peptides = sequences.reject(&:nil?).map { |s| s.peptides.map(&:uniprot_entry).map(&:taxon_id) }

    @peptides = Taxon.find(peptides)

    respond_with(:api, @peptides)
  end

  def lca
    sequences = @sequences.map {|s| Sequence.single_search(s.upcase, @equate_il) }

    name = @equate_il ? :lca_il : :lca
    @taxons = Taxon.includes(:lineage).find(sequences.map(&name))

    respond_with(:api, @taxons)
  end

end
