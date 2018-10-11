class Api::ApiController < ApplicationController
  respond_to :json

  before_action :set_headers, only: %i[pept2taxa pept2lca pept2prot pept2funct pept2ec pept2go peptinfo taxa2lca taxonomy]
  before_action :set_params, only: %i[pept2taxa pept2lca pept2prot pept2funct pept2ec pept2go peptinfo taxa2lca taxonomy]
  before_action :set_query, only: %i[pept2taxa pept2lca peptinfo taxonomy]
  before_action :set_sequences, only: %i[pept2taxa pept2prot]

  before_action :log, only: %i[pept2taxa pept2lca pept2prot pept2funct pept2ec pept2go peptinfo taxa2lca taxonomy]

  # sends a message to the ruby cli
  def messages
    version = params[:version]
    gem_version = Rails.application.config.versions[:gem]
    if Gem::Version.new(gem_version) > Gem::Version.new(version)
      render plain: "Unipept gem #{gem_version} is released!. Run 'gem update unipept' to update."
    else
      render plain: ''
    end
  end

  # Returns a list of Uniprot entries containing a given tryptic peptide
  # params[:input]: Array, required, List of input peptides
  # params[:equate_il]: "true" or "false" (default), optional, Equate I and L?
  # params[:extra]: "true" or "false" (default), optional, Output extra info?
  def pept2prot
    lookup = Hash.new { |h, k| h[k] = Set.new }

    if @extra_info
      @result = {}
      # Perform joins and load objects (expensive)
      ids = []
      @sequences.pluck(:sequence, 'uniprot_entries.id').each do |sequence, uniprot_id|
        ids.append uniprot_id
        lookup[uniprot_id] << sequence
        @result[sequence] = Set.new
      end

      ids = ids.uniq.compact.sort
      UniprotEntry.includes(:taxon, :ec_cross_references, :go_cross_references, :refseq_cross_references, :embl_cross_references)
                  .where(id: ids).find_in_batches do |group|
        group.each do |uni|
          lookup[uni.id].each { |s| @result[s] << uni }
        end
      end
    else
      @result = Hash.new { |h, k| h[k] = Set.new }
      @sequences.pluck(:sequence, 'uniprot_entries.uniprot_accession_number', 'uniprot_entries.name', 'uniprot_entries.taxon_id').each do |sequence, uniprot_id, protein_name, taxon_id|
        @result[sequence] << [uniprot_id, protein_name, taxon_id]
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
    lookup = Hash.new { |h, k| h[k] = Set.new }
    ids = []
    @sequences.pluck(:sequence, :taxon_id).each do |sequence, taxon_id|
      lookup[taxon_id] << sequence
      ids.append(taxon_id)
      @result[sequence] = Set.new
    end

    ids = ids.uniq.compact.sort

    @query.where(id: ids).find_in_batches do |group|
      group.each do |t|
        lookup[t.id].each { |s| @result[s] << t }
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
    @result = pept2lca_helper

    filter_input_order

    respond_with(@result)
  end

  # Returns the functional GO terms and EC numbers for a given tryptic peptide
  # param[input]: Array, required, List of input peptides
  # param[equate_il]: "true" or "false", Indicate if you want to equate I and L
  # param[extra]: "true" or "false", optional, Output extra info?
  # param[split]: "true" or "false", optional, Should GO_terms be split according to namespace?
  def pept2funct
    @result = Hash.new

    ec_result = pept2ec_helper
    go_result = pept2go_helper

    @input_order.each do |seq|
      @result[seq] = {
          :total => go_result[seq][:total],
          :go => go_result[seq][:go],
          :ec => ec_result[seq][:ec]
      }
    end

    respond_with(@result)
  end

  # Returns both the lca, ec and go information for a given tryptic peptide
  # param[input]: Array, required, List of input peptides
  # param[equate_il]: "true" or "false", Indicate if you want to equate I and L
  # param[extra]: "true" or "false", optional, Output extra info?
  # param[split]: "true" or "false", optional, Should GO_terms be split according to namespace?
  def peptinfo
    @result = Hash.new

    lca_result = pept2lca_helper
    ec_result = pept2ec_helper
    go_result  = pept2go_helper

    @input_order.each do |seq|
      @result[seq] = {
          :total => go_result[seq][:total],
          :go => go_result[seq][:go],
          :ec => ec_result[seq][:ec],
          :lca => lca_result[seq]
      }
    end

    respond_with(@result)
  end

  # Returns the functional EC numbers for a given tryptic peptide
  # param[input]: Array, required, List of input peptides
  # param[equate_il]: "true" of "false", Indicate if you want to equate I and L
  # param[extra]: "true" or "false", optional, Output extra info?
  def pept2ec
    @result = pept2ec_helper

    filter_input_order

    respond_with(@result)
  end

  # Returns the functional GO terms for a given tryptic peptide
  # param[input]: Array, required, List of input peptides
  # param[equate_il]: "true" of "false", Indicate if you want to equate I and L
  # param[extra]: "true" or "false", optional, Output extra info?
  # param[split]: "true" or "false", optional, Should GO_terms be split according to namespace?
  def pept2go
    @result = pept2go_helper

    filter_input_order

    respond_with(@result)
  end

  # Returns the lowest common ancestor for a given list of taxon id's
  # param[input]: Array, required, List of input taxon ids
  # param[extra]: "true" or "false", Include lineage
  # param[names]: "true" or "false", Include the lineage names
  def taxa2lca
    # handle case where 1 is provided
    if @input.include? '1'
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
    return unless Rails.application.config.unipept_API_logging
    StatHat::API.ez_post_count('API - ' + action_name, Rails.application.config.unipept_stathat_key, 1)
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
    unsafe_hash = params.to_unsafe_h
    @input = unsafe_hash[:input]
    if @input.is_a? Hash        # hash
      @input = @input.values
    elsif @input.is_a? String   # string
      @input = if @input[0] == '[' # parse json
                 JSON.parse @input
               else # comma separated
                 @input.split(',')
               end
    end
    @input = [] if @input.nil?
    @input = @input.compact.map(&:chomp)
    @input_order = @input.dup

    @equate_il = params[:equate_il] == 'true'
    @names = params[:names] == 'true'
    @domains = params[:domains] == 'true'
    @extra_info = params[:extra] == 'true'

    @input = @input.map { |s| s.tr('I', 'L') } if @equate_il
  end

  # prepares the taxonomy query
  def set_query
    @query = if @extra_info
               if @names
                 Taxon.includes(lineage: Lineage::ORDER_T)
               else
                 Taxon.includes(:lineage)
               end
             else
               Taxon
             end
  end

  # prepares the sequences query
  def set_sequences
    rel_name = @equate_il ? :peptides : :original_peptides
    @sequences = Sequence.joins(rel_name => :uniprot_entry)
                         .where(sequence: @input)
  end

  # Reorders the results according to the input order
  def filter_input_order
    @input_order.select! do |s|
      key = @equate_il ? s.tr('I', 'L') : s
      @result.key? key
    end
  end

  def pept2lca_helper
    output = {}
    lookup = Hash.new { |h, k| h[k] = Set.new }
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
        lookup[t.id].each { |s| output[s] = t }
      end
    end

    output
  end


  def pept2ec_helper
    output = Hash.new

    @sequences = Sequence.where(sequence: @input)

    ec_numbers = []

    @sequences.each do |seq|
      fa = seq.calculate_fa(@equate_il)
      ecs = fa["data"].select { |k, v| k.start_with?("EC:") }

      output[seq.sequence] = {
          :total => fa["num"]["all"],
          :ec => ecs.map do |k, v|
            {
                :ec_number => k[3..-1],
                :protein_count => v
            }
          end
      }

      ec_numbers.push *(ecs.map { |k, _v| k[3..-1] })
    end

    if @extra_info
      ec_numbers = ec_numbers.uniq.compact.sort

      ec_mapping = Hash.new

      EcNumber.where(code: ec_numbers).each do |ec_term|
        ec_mapping[ec_term.code] = ec_term.name
      end

      output.each do |_k, v|
        v[:ec].each do |value|
          value[:name] = ec_mapping[value[:ec_number]]
        end
      end
    end

    output
  end

  def pept2go_helper
    output = Hash.new

    @sequences = Sequence.where(sequence: @input)

    go_terms = []

    @sequences.each do |seq|
      fa = seq.calculate_fa(@equate_il)
      gos = fa["data"].select { |k, v| k.start_with?("GO:") }

      output[seq.sequence] = {
          :total => fa["num"]["all"],
          :go => gos.map do |k, v|
            {
                :go_term => k,
                :protein_count => v
            }
          end
      }

      go_terms.push *(gos.keys)
    end

    if @extra_info or @domains
      go_terms = go_terms.uniq.compact.sort

      go_mapping = Hash.new
      GoTerm.where(code: go_terms).each do |go_term|
        go_mapping[go_term.code] = go_term
      end

      if @domains

        if @extra_info
          set_name = lambda { |value| value[:name] = go_mapping[value[:go_term]].name}
        else
          # Do nothing
          set_name = lambda { }
        end

        # We have to transform the input so that the different GO-terms are split per namespace
        output.each do |_k, v|
          splitted = Hash.new { |h, k1| h[k1] = [] }

          v[:go].each do |value|
            go_term = go_mapping[value[:go_term]]
            set_name[value]
            splitted[go_term.namespace] << value
          end

          v[:go] = splitted
        end
      else
        output.map do |_k, v|
          v[:go].each do |value|
            value[:name] = go_mapping[value[:go_term]].name
          end
        end
      end
    end

    output
  end

end
