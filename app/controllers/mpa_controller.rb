class MpaController < ApplicationController
  before_action :default_format_json, except: ['analyze']
  skip_before_action :verify_authenticity_token, except: ['analyze']

  def analyze
    @header_class = 'MPA'
    @peptides = (params[:qs] || '').lines.map(&:strip).to_json
    @il = params[:il].present?
    @dupes = params[:dupes].present?
    @missed = params[:missed].present?
  end

  def pept2lca
    peptides = params[:peptides] || []
    @equate_il = true # TODO: change me
    @peptides = Sequence.includes(Sequence.lca_t_relation_name(@equate_il) => :lineage).where(sequence: peptides).where.not(Sequence.lca_t_relation_name(@equate_il) => nil)
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
