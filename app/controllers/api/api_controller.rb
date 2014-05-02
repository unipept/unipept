class Api::ApiController < ApplicationController

  respond_to :json

  before_filter :set_params, only: [:single, :lca, :pept2pro]
  before_filter :set_query, only: [:single, :lca]

  def set_params
    @sequences = params[:sequences].map(&:chomp)
    @equate_il = (!params[:equate_il].blank? && params[:equate_il] == 'true')
    @full_lineage = (!params[:full_lineage].blank? && params[:full_lineage] == 'true')
    @names = (!params[:names].blank? && params[:names] == 'true')

    rel_name = @equate_il ? :lca_il_t : :lca_t
    @sequences.each {|s| s.gsub!(/I/,'L') } if @equate_il
  end

  def set_query
    if @full_lineage
      if @names
        @query = Taxon.includes(lineage: Lineage::ORDER_T)
      else
        @query = Taxon.includes(:lineage)
      end
    else
      @query = Taxon
    end

  end

  def single
    @sequences = Sequence.joins(:peptides => :uniprot_entry).
      where(sequence: @sequences)
    @result = {}
    lookup = Hash.new { |h,k| h[k] = Set.new }
    ids = []
    @sequences.pluck_all(:sequence, :taxon_id).each do |e|
      taxon_id = e['taxon_id']
      sequence = e['sequence']
      lookup[taxon_id] << sequence
      ids.append(taxon_id)
      @result[sequence] = Set.new
    end

    ids = ids.uniq.sort rescue []

    @query.where(id: ids).find_in_batches do |group|
      group.each do |t|
        lookup[t.id].each {|s| @result[s] << t}
      end
    end

    respond_with(@result)
  end

  def lca
    @result = {}
    lookup = Hash.new { |h,k| h[k] = Set.new }
    ids = []
    @sequences = Sequence.where(sequence: @sequences)
    @sequences.pluck_all(:sequence, :lca_il).each do |e|
      lca_il = e['lca_il']
      ids.append lca_il
      lookup[lca_il] << e['sequence']
    end

    ids = ids.uniq.sort rescue []

    @query.where(id: ids).find_in_batches do |group|
      group.each do |t|
        lookup[t.id].each { |s| @result[s] = t }
      end
    end

    respond_with(@result)
  end

  def taxa2lca
    @taxon_ids = params[:taxon_ids].map(&:chomp).uniq.sort
    @equate_il = (!params[:equate_il].blank? && params[:equate_il] == 'true')
    @full_lineage = (!params[:full_lineage].blank? && params[:full_lineage] == 'true')

    name = @equate_il ? :lca_il : :lca
    lineages = Lineage.includes(Lineage::ORDER_T).where(taxon_id: @taxon_ids)
    @result = Lineage.calculate_lca_taxon(lineages)

    respond_with(@result)
  end

  def pept2pro
    @result = Hash.new { |h,k| h[k] = Set.new }

    @sequences = Sequence.joins(:peptides => :uniprot_entry).
      where(sequence: @sequences)

    @sequences.pluck_all(:sequence, "uniprot_entries.uniprot_accession_number").each do |e|
      @result[e['sequence']] << e['uniprot_accession_number']
    end

    respond_with(@result)
  end

end
