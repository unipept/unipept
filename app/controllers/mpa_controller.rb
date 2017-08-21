class MpaController < ApplicationController
  def analyze
    @header_class = 'MPA'
    @peptides = (params[:peptides] || '').lines.to_json
  end

  def pept2lca
    peptides = params[:peptides] || []
    equate_il = true # TODO: change me
    results = Sequence.includes(Sequence.lca_t_relation_name(equate_il) => { lineage: Lineage::ORDER_T }).where(sequence: peptides)

    render json: results
  end

end
