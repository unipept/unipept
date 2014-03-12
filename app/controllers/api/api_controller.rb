class Api::ApiController < ApplicationController

  respond_to :json

  before_filter :set_params, only: [:single, :lca]

  def set_params
    @sequences = params[:sequences].map(&:chomp)
    @equate_il = (!params[:equate_il].blank? && params[:equate_il] == 'true')
    @filter = params[:filter]
  end

  def single
    sequences = @sequences.map { |s| Sequence.single_search(s.upcase, @equate_il) }
    peptides = sequences.reject(&:nil?).map { |s| s.peptides.map(&:uniprot_entry).map(&:taxon_id) }

    base_search = @filter.blank? ? Taxon : Taxon.select(@filter)
    peptides = base_search.find(peptides)

    respond_with(:api, peptides)
  end

  def lca
    sequences = @sequences.map {|s| Sequence.single_search(s.upcase, @equate_il) }
    base_search = @filter.blank? ? Taxon : Taxon.select(@filter)
    if @equate_il
      taxons = base_search.find(sequences.map(&:lca_il))
    else
      taxons = base_search.find(sequences.map(&:lca))
    end

    respond_with(:api, taxons)
  end

end
