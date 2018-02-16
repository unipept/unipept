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

    @results_go = Hash.new
    @results_ec = Hash.new

    @peptides.each do |sequence|
      entries = sequence.peptides(equate_il).map(&:uniprot_entry)

      #Count the GO terms
      go_counts = Hash.new 0
      entries.flat_map { |n| n.go_cross_references.map(&:go_term_code)}
             .each {|go| go_counts[go] += 1}


      #Group the GO counts by namespace
      go_summary = Hash.new 0
      go_grouped = go_counts.keys.group_by {|go| GoTerm.find_by(code: go).namespace}
      go_grouped.each do |namespace, go|
        go_summary[namespace] = go.map{ |term| {:code => term, :weight => go_counts[term].fdiv(entries.length)} }
                                  .sort_by{ |score| -score[:weight] }
      end
      @results_go[sequence.sequence] = go_summary

      #Count the EC numbers
      ec_counts = Hash.new 0
      entries.flat_map { |n| n.ec_cross_references.map(&:ec_number_code)}.each {|ec| ec_counts[ec] += 1}
      ec_counts.each_pair { |ecCode, value|  ec_counts[ecCode] = value.fdiv(entries.length)}
      @results_ec[sequence.sequence] = ec_counts
        .map{ |ecCode, value| {:code => ecCode, :weight => value} }
        .sort_by{ |score| -score[:weight] }

    end
  end

  private

  def default_format_json
    request.format = 'json'
  end
end
