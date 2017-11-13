class MpaController < ApplicationController
  before_action :default_format_json, except: ['analyze']
  skip_before_action :verify_authenticity_token, except: ['analyze']

  def analyze
    @header_class = 'MPA'
    @title = 'Metaproteomics analysis result'
    @peptides = (params[:qs] || '').lines.map(&:strip).to_json
    @name = params[:search_name]
    @il = params[:il].present?
    @dupes = params[:dupes].present?
    @missed = params[:missed].present?
  end

  def pept2lca
    peptides = params[:peptides] || []
    missed = params[:missed]
    @equate_il = params[:equate_il]
    @peptides = Sequence
                .includes(Sequence.lca_t_relation_name(@equate_il) => :lineage)
                .where(sequence: peptides)
                .where.not(Sequence.lca_t_relation_name(@equate_il) => nil)
    return unless missed
    @peptides += peptides
                 .to_set.subtract(@peptides.map(&:sequence))
                 .map { |p| Sequence.missed_cleavage_lca(p, @equate_il) }
                 .compact
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
