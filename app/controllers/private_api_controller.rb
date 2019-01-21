class PrivateApiController < ApplicationController
  before_action :default_format_json
  skip_before_action :verify_authenticity_token

  def goterms
    goTerms = params[:goterms] || []
    @goterms = GoTerm.where(code: goTerms)
  end

  def ecnumbers
    ecNrs = params[:ecnumbers]
    @ecnumbers = EcNumber.where(code: ecNrs)
  end

  def taxa
    taxids = params[:taxids] || []
    @taxa = Taxon.where(id: taxids)
  end

  private

  def default_format_json
    request.format = 'json'
  end
end
