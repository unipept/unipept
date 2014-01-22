class Api::ApiController < ApplicationController

  respond_to :json

  def single
    sequence = params[:sequence].upcase
    equate_il = (!params[:equate_il].blank? && params[:equate_il] == 'true')

    sequence = Sequence.single_search(sequence, equate_il)
    peptides = sequence.peptides.map(&:uniprot_entry).map(&:name)

    respond_with(:api, peptides)
  end

end
