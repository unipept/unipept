class Api::ApiController < ApplicationController

  respond_to :json

  before_filter :set_params

  def set_params
    @sequence = params[:sequence].upcase
    @equate_il = (!params[:equate_il].blank? && params[:equate_il] == 'true')
  end

  def single
    sequence = Sequence.single_search(@sequence, @equate_il)
    peptides = sequence.peptides.map(&:uniprot_entry).map(&:name)

    respond_with(:api, peptides)
  end


  def lca
    sequence = Sequence.single_search(@sequence, @equate_il)
    if @equate_il
      taxon = Taxon.find(sequence.lca_il)
    else
      taxon = Taxon.find(sequence.lca)
    end

    respond_with(:api, taxon)
  end

end
