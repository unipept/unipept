class Api::ApiController < ApplicationController

  respond_to :json

  before_filter :set_headers, only: [:pept2taxa, :pept2lca, :pept2prot, :taxa2lca, :taxonomy]
  before_filter :set_params, only: [:pept2taxa, :pept2lca, :pept2prot, :taxa2lca, :taxonomy]
  before_filter :set_query, only: [:pept2taxa, :pept2lca, :taxonomy]
  before_filter :set_sequences, only: [:pept2taxa, :pept2prot]

  before_filter :log, only: [:pept2taxa, :pept2lca, :pept2prot, :taxa2lca, :taxonomy]

  # sends a message to the ruby cli
  def messages
    version = params[:version]
    gem_version = Rails.application.config.versions[:gem]
    if Gem::Version.new(gem_version) > Gem::Version.new(version)
      render text: "Unipept gem #{gem_version} is released!. Run 'gem update unipept' to update."
    else
      render text: ""
    end
  end


  # Returns a list of Uniprot entries containing a given tryptic peptide
  # params[:input]: Array, required, List of input peptides
  # params[:equate_il]: "true" or "false" (default), optional, Equate I and L?
  # params[:extra]: "true" or "false" (default), optional, Output extra info?
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

      ids = ids.uniq.compact.sort
      UniprotEntry.includes(:name,:ec_cross_references, :go_cross_references, :refseq_cross_references, :embl_cross_references).
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


  # Returns a list of taxa retrieved from the Uniprot entries containing a given tryptic peptide
  # param[input]: Array, required, List of input peptides
  # param[equate_il]: "true" or "false", Indicate if you want to equate I and L
  # param[extra]: "true" or "false", Include lineage
  # param[names]: "true" or "false", Include the lineage names
  def pept2taxa
    @result = {}
    lookup = Hash.new { |h,k| h[k] = Set.new }
    ids = []
    @sequences.pluck(:sequence, :taxon_id).each do |sequence,taxon_id|
      lookup[taxon_id] << sequence
      ids.append(taxon_id)
      @result[sequence] = Set.new
    end

    ids = ids.uniq.compact.sort

    @query.where(id: ids).find_in_batches do |group|
      group.each do |t|
        lookup[t.id].each {|s| @result[s] << t}
      end
    end

    filter_input_order

    respond_with(@result)
  end


  # Returns the taxonomic lowest common ancestor for a given tryptic peptide
  # param[input]: Array, required, List of input peptides
  # param[equate_il]: "true" or "false", Indicate if you want to equate I and L
  # param[extra]: "true" or "false", Include lineage
  # param[names]: "true" or "false", Include the lineage names
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

    ids = ids.uniq.compact.sort

    @query.where(id: ids).find_in_batches do |group|
      group.each do |t|
        lookup[t.id].each { |s| @result[s] = t }
      end
    end

    filter_input_order

    respond_with(@result)
  end


  # Returns the lowest common ancestor for a given list of taxon id's
  # param[input]: Array, required, List of input taxon ids
  # param[extra]: "true" or "false", Include lineage
  # param[names]: "true" or "false", Include the lineage names
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

  # Returns the taxonomic information for a given list of taxon id's
  # param[input]: Array, required, List of input taxon ids
  # param[extra]: "true" or "false", Include lineage
  # param[names]: "true" or "false", Include the lineage names
  def taxonomy
    @result = @query.where(id: @input)
    @result = Hash[@result.map { |t| [t.id, t] }]
    @input_order = @input.select { |i| @result.key? i.to_i }
    @result = @input_order.map { |i| @result[i.to_i] }
    respond_with(@result)
  end


  private

  # log all api calls to stathat
  def log
    if Rails.application.config.unipept_API_logging
      StatHat::API.ez_post_count('API - ' + action_name, Rails.application.config.unipept_stathat_key, 1)
    end
  end

  # enable cross origin requests
  def set_headers
    headers['Access-Control-Allow-Origin'] = '*'
    headers['Access-Control-Expose-Headers'] = 'ETag'
    headers['Access-Control-Allow-Methods'] = 'GET, POST'
    headers['Access-Control-Allow-Headers'] = '*,x-requested-with,Content-Type,If-Modified-Since,If-None-Match'
    headers['Access-Control-Max-Age'] = '86400'
  end

  # handles the parameters
  def set_params
    @input = params[:input]
    if @input.kind_of? Hash        # hash
      @input = @input.values
    elsif @input.kind_of? String   # string
      if @input[0] == "["          # parse json
        @input = JSON.parse @input
      elsif                        # comma separated
        @input = @input.split(",");
      end
    end
    @input = [] if @input.nil?
    @input.map!(&:chomp)
    @input_order = @input.dup

    @equate_il = params[:equate_il] == 'true'
    @extra_info = params[:extra] == 'true'
    @names = params[:names] == 'true'

    @input = @input.map {|s| s.gsub(/I/,'L') } if @equate_il
  end

  # prepares the taxonomy query
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

  # prepares the sequences query
  def set_sequences
    rel_name = @equate_il ? :peptides : :original_peptides
    @sequences = Sequence.joins(rel_name => :uniprot_entry).
      where(sequence: @input)
  end

  # Reorders the results according to the input order
  def filter_input_order
    @input_order.select! do |s|
      key = @equate_il ? s.gsub(/I/,'L') : s
      @result.has_key? key
    end
  end

end
