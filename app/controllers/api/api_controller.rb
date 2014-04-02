class Api::ApiController < ApplicationController

  respond_to :json

  before_filter :set_params, only: [:single, :lca, :pept2pro]

  def set_params
    @sequences = params[:sequences].map(&:chomp)
    @equate_il = (!params[:equate_il].blank? && params[:equate_il] == 'true')
    @full_lineage = (!params[:full_lineage].blank? && params[:full_lineage] == 'true')
  end

  def single
    @result = {}
    rel_name = @equate_il ? :lca_il_t : :lca_t
    @sequences.each {|s| s.gsub!(/I/,'L') } if @equate_il
    sequences = Sequence.find_all_by_sequence(@sequences, :include => { rel_name => {:lineage => [:superkingdom_t, :kingdom_t, :subkingdom_t, :superphylum_t, :phylum_t, :subphylum_t, :superclass_t, :class_t, :subclass_t, :infraclass_t, :superorder_t, :order_t, :suborder_t, :infraorder_t, :parvorder_t, :superfamily_t, :family_t, :subfamily_t, :tribe_t, :subtribe_t, :genus_t, :subgenus_t, :species_group_t, :species_subgroup_t, :species_t, :subspecies_t, :varietas_t, :forma_t]}})
    sequences.each do |s|
      entries = s.peptides.map(&:uniprot_entry)
      @result[s] = Taxon.includes(:lineage).where(id: entries.map(&:taxon_id))
    end

    respond_with(@result)
  end

  def lca
    @result = {}
    rel_name = @equate_il ? :lca_il_t : :lca_t
    @sequences.each {|s| s.gsub!(/I/,'L') } if @equate_il
    sequences = Sequence.find_all_by_sequence(@sequences, :include => { rel_name => {:lineage => [:superkingdom_t, :kingdom_t, :subkingdom_t, :superphylum_t, :phylum_t, :subphylum_t, :superclass_t, :class_t, :subclass_t, :infraclass_t, :superorder_t, :order_t, :suborder_t, :infraorder_t, :parvorder_t, :superfamily_t, :family_t, :subfamily_t, :tribe_t, :subtribe_t, :genus_t, :subgenus_t, :species_group_t, :species_subgroup_t, :species_t, :subspecies_t, :varietas_t, :forma_t]}})
    sequences.each do |s|
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
    rel_name = @equate_il ? :lca_il_t : :lca_t
    @sequences.each {|s| s.gsub!(/I/,'L') } if @equate_il
    sequences = Sequence.find_all_by_sequence(@sequences, :include => { rel_name => {:lineage => [:superkingdom_t, :kingdom_t, :subkingdom_t, :superphylum_t, :phylum_t, :subphylum_t, :superclass_t, :class_t, :subclass_t, :infraclass_t, :superorder_t, :order_t, :suborder_t, :infraorder_t, :parvorder_t, :superfamily_t, :family_t, :subfamily_t, :tribe_t, :subtribe_t, :genus_t, :subgenus_t, :species_group_t, :species_subgroup_t, :species_t, :subspecies_t, :varietas_t, :forma_t]}})
    sequences.each do |s|
      @result[s] = s.peptides.map(&:uniprot_entry) if s
    end

    respond_with(@result)
  end

end
