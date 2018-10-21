class MpaController < ApplicationController
  before_action :default_format_json, except: ['analyze']
  skip_before_action :verify_authenticity_token, except: ['analyze']

  def analyze
    @header_class = 'MPA'
    @title = 'Metaproteomics analysis result'
    @selected_datasets = params[:data]
  end

  def pept2data
    peptides = params[:peptides] || []
    missed = params[:missed]
    @equate_il = params[:equate_il]
    @peptides = Sequence
                .includes(Sequence.lca_t_relation_name(@equate_il) => :lineage)
                .where(sequence: peptides)
                .where.not(Sequence.lca_t_relation_name(@equate_il) => nil)
    if missed
      @peptides += peptides
                   .to_set.subtract(@peptides.map(&:sequence))
                   .map { |p| Sequence.missed_cleavage(p, @equate_il) }
                   .compact
    end

    @results_fa = {}
    @peptides.each do |sequence|
      @results_fa[sequence.sequence] = sequence.calculate_fa(@equate_il)
    end
  end

  private

  def default_format_json
    request.format = 'json'
  end
end
