class Api::ApiController < ApplicationController

  respond_to :json

  before_filter :set_params, only: [:single, :lca, :pept2pro]

  def set_params
    @sequences = params[:sequences].map(&:chomp)
    @equate_il = (!params[:equate_il].blank? && params[:equate_il] == 'true')
    @full_lineage = (!params[:full_lineage].blank? && params[:full_lineage] == 'true')

    rel_name = @equate_il ? :lca_il_t : :lca_t
    @sequences.each {|s| s.gsub!(/I/,'L') } if @equate_il
    @sequences = Sequence.includes(:peptides => {:uniprot_entry => :name}).
      find_all_by_sequence(@sequences, :include => { rel_name => :lineage })
  end

  def single
    @result = {}
    @sequences.each do |s|
      entries = s.peptides.map(&:uniprot_entry)
      @result[s.sequence] = Taxon.includes(:lineage).where(id: entries.map(&:taxon_id))
    end

    respond_with(@result)
  end

  def lca
    @result = {}
    @sequences.each do |s|
      taxon = s.calculate_lca(@equate_il, true)
      @result[s.sequence] = taxon if taxon
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
    @result = {}
    @sequences.each do |s|
      @result[s.sequence] = s.peptides.map(&:uniprot_entry) if s
    end

    respond_with(@result)
  end

end
