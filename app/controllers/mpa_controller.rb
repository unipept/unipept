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

  def pept2fa
    equate_il = (params[:equate_il] == 'equateIL')
    peptides = params[:peptides] || []

    #Lookup the peptides
    @peptides = Sequence
        .includes(Sequence.peptides_relation_name(equate_il) => { uniprot_entry: %i[go_cross_references ec_cross_references] })
        .where(sequence: peptides)

    @results_fa = Hash.new

    @peptides.each do |sequence|
      entries = sequence.peptides(equate_il).map(&:uniprot_entry)
      @results_fa[sequence.sequence] = UniprotEntry.summarize_fa(entries)
    end
  end

  private

  def default_format_json
    request.format = 'json'
  end
end
