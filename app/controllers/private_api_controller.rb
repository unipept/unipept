class PrivateApiController < HandleOptionsController
  before_action :set_headers, only: %i[goterms ecnumbers interpros taxa proteins]
  before_action :default_format_json
  skip_before_action :verify_authenticity_token

  def goterms
    go_terms = params[:goterms] || []
    @goterms = GoTerm.where(code: go_terms)
  end

  def ecnumbers
    ec_nrs = params[:ecnumbers]
    @ecnumbers = EcNumber.where(code: ec_nrs)
  end

  def interpros
    interpro_entries = params[:interpros]
    @interpros = InterproEntry.where(code: interpro_entries)
  end

  def taxa
    taxids = params[:taxids] || []
    @taxa = Taxon.includes(:lineage).where(id: taxids)
  end

  def proteins
    # process parameters
    # the sequence or id of the peptide (filter out all characters that are non-ASCII)
    seq = params[:peptide].upcase.gsub(/\P{ASCII}/, '')
    # should we equate I and L? (true by default)
    equate_il = params.key?(:equate_il) ? params[:equate_il] : true

    # process the input, convert seq to a valid @sequence
    sequence = Sequence.single_search(seq, equate_il)
    @original_sequence = seq

    if sequence.present? && sequence.peptides(equate_il).empty?
      @entries = []
      return
    end

    @common_lineage = []

    # get the uniprot entries of every peptide
    # only used for the open in uniprot links
    # and calculate the LCA
    if sequence.nil?
      begin
        # we didn't find the sequence in the database, so let's try to split it
        long_sequences = Sequence.advanced_single_search(seq, equate_il)
      rescue NoMatchesFoundError
        return
      end
      # calculate possible uniprot entries
      temp_entries = long_sequences.map { |s| s.peptides(equate_il).map(&:uniprot_entry).to_set }
      # take the intersection of all sets
      @entries = temp_entries.reduce(:&)
      # check if the protein contains the startsequence
      @entries.select! { |e| e.protein_contains?(seq, equate_il) }

      # Calculate fa summary
      @fa_summary = UniprotEntry.summarize_fa(@entries)

      return if @entries.empty?

      @lineages = @entries.map(&:lineage).compact
    else
      @entries = sequence.peptides(equate_il).map(&:uniprot_entry)
      @lineages = sequence.lineages(equate_il, true).to_a

      # Get FA summary from cache
      @fa_summary = sequence.calculate_fa(equate_il)
    end

    # sort entries
    @entries = @entries.to_a.sort_by { |e| e.taxon.nil? ? '' : e.taxon.name }

    @lca_taxon = Lineage.calculate_lca_taxon(@lineages)
    @root = Node.new(1, 'Organism', nil, 'root') # start constructing the tree
    common_hits = @lineages.map(&:hits).reduce(:+)
    @root.data['count'] = common_hits
    last_node = @root

    # common lineage
    # construct the common lineage in this array
    l = @lca_taxon.lineage
    found = (@lca_taxon.name == 'root')
    while !found && l.has_next?
      t = l.next_t
      next if t.nil?

      found = (@lca_taxon.id == t.id)
      @common_lineage << t
      node = Node.new(t.id, t.name, @root, t.rank)
      node.data['count'] = common_hits
      last_node = last_node.add_child(node)
    end
  end

  private

  def default_format_json
    request.format = 'json'
  end
end
