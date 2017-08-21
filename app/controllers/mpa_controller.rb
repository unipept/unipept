class MpaController < ApplicationController
  before_action :default_format_json, except: ['analyze']
  skip_before_action :verify_authenticity_token, except: ['analyze']

  def analyze
    @header_class = 'MPA'
    #@peptides = (params[:peptides] || '').lines.to_json TODO
    @peptides = ["aalter", "ENDLVVK", "AAAADLAPLPR"].to_json
  end

  def pept2lca
    peptides = params[:peptides] || []
    @equate_il = true # TODO: change me
    # for now without names
    # @peptides = Sequence.includes(Sequence.lca_t_relation_name(@equate_il) => { lineage: Lineage::ORDER_T }).where(sequence: peptides)
    @peptides = Sequence.includes(Sequence.lca_t_relation_name(@equate_il) => :lineage).where(sequence: peptides)
  end

  private

  def default_format_json
    request.format = 'json'
  end
end
