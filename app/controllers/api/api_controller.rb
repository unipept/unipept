class Api::ApiController < ApplicationController

  resource_description do
    api_version 'v1'
    formats ['json']
  end

  respond_to :json

  before_filter :set_params, only: [:pept2taxa, :pept2lca, :pept2prot, :taxa2lca, :taxonomy]
  before_filter :set_query, only: [:pept2taxa, :pept2lca, :taxonomy]
  before_filter :set_sequences, only: [:pept2taxa, :pept2prot]

  before_filter :log, only: [:pept2taxa, :pept2lca, :pept2prot, :taxa2lca, :taxonomy]

  def set_params
    @input = params[:input]
    if @input.kind_of? Hash
      @input = @input.values
    end
    @input.map! &:chomp
    @input_order = @input.dup

    @equate_il = (!params[:equate_il].blank? && params[:equate_il] == 'true')
    @extra_info = (!params[:extra].blank? && params[:extra] == 'true')
    @names = (!params[:names].blank? && params[:names] == 'true')

    @input = @input.map {|s| s.gsub(/I/,'L') } if @equate_il
  end

  def set_query
    if @extra_info
      if @names
        @query = Taxon.includes(lineage: Lineage::ORDER_T)
      else
        @query = Taxon.includes(:lineage)
      end
    else
      @query = Taxon
    end
  end

  def set_sequences
    rel_name = @equate_il ? :peptides : :original_peptides
    @sequences = Sequence.joins(rel_name => :uniprot_entry).
      where(sequence: @input)
  end

  def messages
    version = params[:version]
    render text: "Unipept 0.4.0 is released!"
  end

  def log
    if Rails.application.config.unipept_API_logging
      StatHat::API.ez_post_count('API - ' + action_name, Rails.application.config.unipept_stathat_key, 1)
    end
  end


  api :POST, '/v1/pept2taxa', "Returns all the taxa in which input peptides are present"
  param :input, Array, required: true, description: "List of input peptides"
  param :equate_il, ['true','false'], description: "Indicate if you want to equate I and L"
  param :extra, ['true','false'], description: "Request extra information such as the entire lineage"
  param :names, ['true','false'], description: "Include the lineage names"

  description <<-EOS
  The api is strictly on a per peptide basis, there is no aggregation. However due to speed concerns there is a possibility to pass
  multiple peptides.  It will lookup all the proteins in which a given input peptide is present, of these proteins it will find all
  the organisms and return its taxon_id, taxon_name, ...
  EOS
  example <<-EOS
  $ curl -X POST -H "Accept: application/json" scruffy.ugent.be/api/v1/pept2taxa -d 'input[0]=SASLGR'
  [{"sequence":"SASLGR","taxon_id":3055,"taxon_name":"Chlamydomonas reinhardtii","taxon_parent_id":3052,"taxon_rank":"species"},...]
  EOS
  def pept2taxa
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

  api :POST, '/v1/pept2lca', "Returns the lowest common ancestor per input peptide"
  param :input, Array, required: true, description: "List of input peptides"
  param :equate_il, ['true','false'], description: "Indicate if you want to equate I and L"
  param :extra, ['true','false'], description: "Request extra information such as the entire lineage"
  param :names, ['true','false'], description: "Include the lineage names"
  description <<-EOS
  For each input peptide, return the lowest common ancestor as found in the unipept database.
  EOS
  example <<-EOS
  $ curl -X POST -H "Accept: application/json" scruffy.ugent.be/api/v1/pept2lca -d 'input[0]=ASFHLECIK' -d 'equate_il=false'
  []

  $ curl -X POST -H "Accept: application/json" scruffy.ugent.be/api/v1/pept2lca -d 'input[0]=ASFHLECIK' -d 'equate_il=true'
  [{"sequence":"ASFHLECIK","taxon_id":7776,"taxon_name":"Gnathostomata","taxon_parent_id":7742,"taxon_rank":"superclass"}]
  EOS
  def pept2lca
    @result = {}
    lookup = Hash.new { |h,k| h[k] = Set.new }
    ids = []
    @sequences = Sequence.where(sequence: @input)
    lca_field = @equate_il ? :lca_il : :lca
    @sequences.pluck(:sequence, lca_field).each do |sequence, lca_il|
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

  api :POST, '/v1/taxa2lca', "calculates the lowest common ancestor of given taxon ids"
  param :input, Array, required: true, description: "List of input taxon ids"
  param :extra, ['true','false'], description: "Request extra information such as the entire lineage"
  param :names, ['true','false'], description: "Include the lineage names"
  description <<-EOS
  This will actually calculate the lowest common ancestor of all the lineages of all the taxon ids passed via the input paramater.
  EOS
  example <<-EOS
  $ curl -X POST -H "Accept: application/json" scruffy.ugent.be/api/v1/taxa2lca -d 'input[0]=816' -d 'input[1]=124'
  {"taxon_id":2,"taxon_name":"Bacteria","taxon_parent_id":131567,"taxon_rank":"superkingdom"}
  EOS
  def taxa2lca
    # handle case where 1 is provided
    if @input.include? "1"
      @result = Taxon.find(1)
    else
      lineages = Lineage.includes(Lineage::ORDER_T).where(taxon_id: @input)
      @result = Lineage.calculate_lca_taxon(lineages)
    end

    respond_with(@result)
  end

  api :POST, '/v1/pept2prot', "Returns uniprot ids for given input peptides"
  param :input, Array, required: true, description: "List of input peptides"
  param :equate_il, ['true','false'], description: "Indicate if you want to equate I and L"
  param :extra, ['true','false'], description: "Request extra information such as the entire lineage"
  param :names, ['true','false'], description: "Include the lineage names"
  description <<-EOS
  Returns uniprot information of the proteins in which the input peptides are found
  EOS
  example <<-EOS
  $ curl -X POST -H "Accept: application/json" scruffy.ugent.be/api/v1/pept2prot -d 'input[0]=SASLGR'
  [{"sequence":"SASLGR","uniprot_id":"Q99243","taxon_id":9986}, ...]
  EOS
  def pept2prot
    lookup = Hash.new { |h,k| h[k] = Set.new }

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
      UniprotEntry.includes(:name,:ec_cross_references, :go_cross_references).
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

  def taxonomy
    @result = @query.where(id: @input)
    respond_with(@result)
  end

  def filter_input_order
    @input_order.select! do |s|
      key = @equate_il ? s.gsub(/I/,'L') : s
      @result.has_key? key
    end
  end

end
