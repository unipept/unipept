class Api::ApiController < ApplicationController

  respond_to :json

  before_filter :set_params, only: [:single, :lca, :pept2pro]
  before_filter :set_query, only: [:single, :lca]


  def set_params
    @sequences = params[:sequences]
    if @sequences.kind_of? Hash
      @sequences = @sequences.values
    end
    @sequences.map! &:chomp
    @input_order = @sequences.dup

    @equate_il = (!params[:equate_il].blank? && params[:equate_il] == 'true')
    @full_lineage = (!params[:full_lineage].blank? && params[:full_lineage] == 'true')
    @names = (!params[:names].blank? && params[:names] == 'true')

    @sequences = @sequences.map {|s| s.gsub(/I/,'L') } if @equate_il
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
    @sequences.pluck(:sequence, :taxon_id).each do |sequence,taxon_id|
      lookup[taxon_id] << sequence
      ids.append(taxon_id)
      @result[sequence] = Set.new
    end

    ids = ids.uniq.reject(&:nil?).sort

    @query.where(id: ids).find_in_batches do |group|
      group.each do |t|
        lookup[t.id].each {|s| @result[s] << t}
      end
    end

    filter_input_order

    respond_with(@result)
  end

  def lca
    @result = {}
    lookup = Hash.new { |h,k| h[k] = Set.new }
    ids = []
    @sequences = Sequence.where(sequence: @sequences)
    @sequences.pluck(:sequence, :lca_il).each do |sequence, lca_il|
      ids.append lca_il
      lookup[lca_il] << sequence
    end

    ids = ids.uniq.reject(&:nil?).sort

    @query.where(id: ids).find_in_batches do |group|
      group.each do |t|
        lookup[t.id].each { |s| @result[s] = t }
      end
    end

    filter_input_order

    respond_with(@result)
  end

  def taxa2lca
    taxon_ids = params[:taxon_ids]
    if taxon_ids.kind_of? Hash
      taxon_ids = taxon_ids.values
    end
    @taxon_ids = taxon_ids.map(&:chomp).uniq.sort
    @equate_il = (!params[:equate_il].blank? && params[:equate_il] == 'true')
    @full_lineage = (!params[:full_lineage].blank? && params[:full_lineage] == 'true')

    name = @equate_il ? :lca_il : :lca
    lineages = Lineage.includes(Lineage::ORDER_T).where(taxon_id: @taxon_ids)
    @result = Lineage.calculate_lca_taxon(lineages)

    respond_with(@result)
  end

  def pept2pro
    @extra_info = (!params[:extra].blank? && params[:extra] == 'true')
    lookup = Hash.new { |h,k| h[k] = Set.new }

    @sequences = Sequence.joins(:peptides => :uniprot_entry).
      where(sequence: @sequences)

    if @extra_info
      @result = Hash.new
      # Perform joins and load objects (expensive)
      ids = []
      @sequences.pluck(:sequence, "uniprot_entries.id").each do |sequence, uniprot_id|
        ids.append uniprot_id
        lookup[uniprot_id] << sequence
        @result[sequence] = Set.new
      end

      ids = ids.uniq.reject(&:nil?).sort
      # this does not work for now, incorrect setup of relations
      UniprotEntry. #includes(:refseq_cross_references, :ec_cross_references, :go_cross_references).
        where(id: ids).find_in_batches do |group|

        group.each do |uni|
          lookup[uni.id].each {|s| @result[s] << uni}
        end
      end
    else
      @result = Hash.new { |h,k| h[k] = Set.new }
      @sequences.pluck(:sequence, "uniprot_entries.uniprot_accession_number", "uniprot_entries.taxon_id").each do |sequence, uniprot_id, taxon_id|
        @result[sequence] << [uniprot_id, taxon_id]
      end
    end

    filter_input_order

    respond_with(@result)
  end

  def filter_input_order
    @input_order.select! do |s|
      key = @equate_il ? s.gsub(/I/,'L') : s
      @result.has_key? key
    end
  end

end
