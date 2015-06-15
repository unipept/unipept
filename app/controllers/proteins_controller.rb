class ProteinsController < ApplicationController
  include Utils

  def show
    # process parameters
    # should we equate I and L?
    equate_il = (params[:equate_il] == "equateIL")
    # the sequence or id of the protein
    prot = params[:q].gsub(/\s+/, "").upcase

    # get the peptides
    logger.debug prot2pept(prot)
  end
end
