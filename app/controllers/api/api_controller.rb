class Api::ApiController < ApplicationController

  respond_to :json

  before_filter :set_params, only: [:single, :lca, :pept2pro]

  def set_params
    @sequences = params[:sequences].map(&:chomp)
    @equate_il = (!params[:equate_il].blank? && params[:equate_il] == 'true')
    @full_lineage = (!params[:full_lineage].blank? && params[:full_lineage] == 'true')

    rel_name = @equate_il ? :lca_il_t : :lca_t
    @sequences.each {|s| s.gsub!(/I/,'L') } if @equate_il
    @sequences = Sequence.joins(:peptides => {:uniprot_entry => :name}).
      where(sequence: @sequences)
  end

  def single
    @result = {}
    lookup = Hash.new { |h,k| h[k] = Set.new }
    @sequences.pluck_all(:sequence, :taxon_id).each do |e|
      lookup[e['taxon_id']] << e['sequence']
      @result[e['sequence']] = Set.new
    end

    ids = @sequences.order(:taxon_id).pluck("DISTINCT taxon_id")
    if @full_lineage
      query = Taxon.includes(lineage: Lineage::ORDER_T)
    else
      query = Taxon
    end

    query.where(id: ids).find_in_batches do |group|
      group.each do |t|
        lookup[t.id].each {|s| @result[s] << t}
      end
    end

    respond_with(@result)
  end

  def lca
    @result = {}
    lookup = Hash.new { |h,k| h[k] = Set.new }
    @sequences.pluck_all(:sequence, :lca_il).each do |e|
      lookup[e['lca_il']] << e['sequence']
    end

    ids = @sequences.order(:lca_il).pluck("DISTINCT lca_il")
    if @full_lineage
      query = Taxon.includes(lineage: Lineage::ORDER_T)
    else
      query = Taxon
    end

    query.where(id: ids).find_in_batches do |group|
      group.each do |t|
        lookup[t.id].each { |s| @result[s] = t }
      end
    end

    respond_with(@result)
  end

  def taxa2lca
    @taxon_ids = params[:taxon_ids].map(&:chomp)
    @equate_il = (!params[:equate_il].blank? && params[:equate_il] == 'true')
    @full_lineage = (!params[:full_lineage].blank? && params[:full_lineage] == 'true')

    name = @equate_il ? :lca_il : :lca
    lineages = Taxon.includes(lineage: Lineage::ORDER_T).find(@taxon_ids).map(&:lineage)
    @result = Lineage.calculate_lca_taxon(lineages)

    respond_with(@result)
  end

  def pept2pro
    @result = Hash.new { |h,k| h[k] = Set.new }
    lookup = Hash.new { |h,k| h[k] = Set.new }

    @sequences.pluck_all(:sequence, "uniprot_entries.id").each do |e|
      lookup[e['id']] << e['sequence']
    end

    ids = @sequences.order("uniprot_entries.id").pluck("DISTINCT uniprot_entries.id")
    ids.each do |t|
      lookup[t.to_i].each { |s| @result[s] << t }
    end

    respond_with(@result)
  end

end
