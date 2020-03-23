class PrivateApiController < HandleOptionsController
  before_action :set_headers, only: %i[goterms ecnumbers interpros taxa]
  before_action :default_format_json
  skip_before_action :verify_authenticity_token

  def goterms
    go_terms = params[:goterms] || []
    @goterms = GoTerm.where(code: go_terms)
  end

  def ecnumbers
    ec_nrs = params[:ecnumbers]
    @ecnumbers = EcNumber.where(code: ec_nrs)
  end

  def interpros
    interpro_entries = params[:interpros]
    @interpros = InterproEntry.where(code: interpro_entries)
  end

  def taxa
    taxids = params[:taxids] || []
    @taxa = Taxon.includes(:lineage).where(id: taxids)
  end

  private

  def default_format_json
    request.format = 'json'
  end
end
