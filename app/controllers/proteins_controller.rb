class ProteinsController < ApplicationController
  include Utils

  def show
    # process parameters
    # should we equate I and L?
    equate_il = (params[:equate_il] == "equateIL")
    # the sequence or id of the protein
    prot = params[:id].upcase

    # get the peptides
    logger.debug prot2pept(prot)
  end

  # redirects to show
  def search
    redirect_to "#{proteins_path}/#{params[:q]}/#{params[:il_s]}"
  end
end
