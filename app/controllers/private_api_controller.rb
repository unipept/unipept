class PrivateApiController < ApplicationController
  before_action :default_format_json
  skip_before_action :verify_authenticity_token

  def lineages
    taxids = params[:taxids] || []
    @lineages = Lineage.where(taxon_id: taxa)
  end

  def goterms
    go_terms = params[:goterms] || []
    @goterms = GoTerm.where(code: go_terms)
  end

  def ecnumbers
    ec_nrs = params[:ecnumbers]
    @ecnumbers = EcNumber.where(code: ec_nrs)
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
