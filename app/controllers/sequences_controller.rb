class SequencesController < ApplicationController
  require 'oj'

  # shows information about a peptide
  # the peptide should be in params[:id] and
  # can be a peptide id or the sequence itself
  def show
    @header_class = 'TPA'
    # process parameters
    # should we equate I and L?
    equate_il = (params[:equate_il] == 'equateIL')
    # the sequence or id of the peptide
    seq = params[:id].upcase.gsub(/\P{ASCII}/, '')

    # process the input, convert seq to a valid @sequence
    if seq.match(/\A[0-9]+\z/)
      sequence = Sequence.includes(peptides: { uniprot_entry: [:taxon, :ec_cross_references, :go_cross_references] }).find_by_id(seq)
      @original_sequence = sequence.sequence
    else
      sequence = Sequence.single_search(seq, equate_il)
      @original_sequence = seq
    end

    # quit if it doensn't contain any peptides
    fail(NoMatchesFoundError, sequence.sequence) if sequence.present? && sequence.peptides(equate_il).empty?

    # get the uniprot entries of every peptide
    # only used for the open in uniprot links
    # and calculate the LCA
    if sequence.nil?
      # we didn't find the sequence in the database, so let's try to split it
      long_sequences = Sequence.advanced_single_search(seq, equate_il)
      # calculate possible uniprot entries
      temp_entries = long_sequences.map { |s| s.peptides(equate_il).map(&:uniprot_entry).to_set }
      # take the intersection of all sets
      @entries = temp_entries.reduce(:&)
      # check if the protein contains the startsequence
      @entries.select! { |e| e.protein_contains?(seq, equate_il) }

      fail(NoMatchesFoundError, seq) if @entries.empty?
      @lineages = @entries.map(&:lineage).compact
    else
      @entries = sequence.peptides(equate_il).map(&:uniprot_entry)
      @lineages = sequence.lineages(equate_il, true).to_a
    end

    @lca_taxon = Lineage.calculate_lca_taxon(@lineages) # calculate the LCA
    @root = Node.new(1, 'Organism', nil, 'root') # start constructing the tree
    common_hits = @lineages.map(&:hits).reduce(:+)
    @root.data['count'] = common_hits
    last_node = @root

    # common lineage
    @common_lineage = [] # construct the common lineage in this array
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

    # distinct lineage
    @lineages.map { |lineage| lineage.set_iterator_position(l.get_iterator_position) }
    @lineages.each do |lineage|
      last_node_loop = last_node
      l = []
      while lineage.has_next?
        t = lineage.next_t
        next if t.nil?
        l << t.name # add the taxon name to the lineage
        node = Node.find_by_id(t.id, @root)
        if node.nil? # if the node isn't create yet
          node = Node.new(t.id, t.name, @root, t.rank)
          node.data['count'] = lineage.hits
          last_node_loop = last_node_loop.add_child(node)
        else
          node.data['count'] += lineage.hits
          last_node_loop = node
        end
      end
    end

    # don't show the root when we don't need it
    @root.sort_children
    @root = Oj.dump(@root, mode: :compat)

    # Table stuff
    @table_lineages = []
    @table_ranks = []

    @lineages.uniq!
    @table_lineages << @lineages.map { |lineage| lineage.name.name }
    @table_ranks << 'Organism'
    @lineages.map { |lineage| lineage.set_iterator_position(0) } # reset the iterator
    while @lineages[0].has_next?
      temp = @lineages.map(&:next_t)
      if temp.compact.length > 0 # don't do anything if it only contains nils
        @table_lineages << temp
        @table_ranks << temp.compact[0].rank
      end
    end

    # sort by id from left to right
    root_taxon = Taxon.find(1)
    @table_lineages = @table_lineages.transpose.sort_by { |k| k[1..-1].map! { |lin| lin || root_taxon } }

    # sort entries
    @entries = @entries.to_a.sort_by { |e| e.taxon.nil? ? '' : e.taxon.name }

    @title = "Tryptic peptide analysis of #{@original_sequence}"

    # EC related stuff
    # Here the EC table and EC tree are generated
    # create global variables
    @ec_self_count = {}
    @ec_ontologies = {}
    @ec_functions = {}
    @ec_ontology_count = {}
    @ec_table = {}
    @ec_lca_root = {}
    @org_count = {}
    @org_ec = {}

    # preload ec data
    # preload EcNumber table
    ec_db = EcNumber.all
    # get all accossiated EC code
    ec_cross_numbers = @entries.map(&:ec_cross_references)
    # array of ec code
    ec_numbers_list = ec_cross_numbers.map{|ecs| ecs.map{|ec| ec[:ec_number_code]}}.compact.flatten(1)
    # make list unique
    ec_numbers_uniq = ec_numbers_list.uniq

    # get the functions of each ECs and its ontology
    # get all ontologies for each ec
    ec_numbers_uniq.each do |ecn|
      @ec_ontologies[ecn] = EcNumber.get_ontology(ecn)
    end
    # get ECs ontology functions
    ec_ontologies_only = @ec_ontologies.values.flatten(1).uniq
    @ec_functions = EcNumber.get_ec_function(ec_ontologies_only, ec_db)

    # calculate the amount of ECs per node and 
    # The amount of ECs along the branch
    ec_numbers_uniq.each do |ec|
      @ec_self_count[ec] = ec_numbers_list.count(ec)
    end
    @ec_ontology_count = EcNumber.count_ontology(@ec_self_count)

    # EC table related stuff
    # sort found EC numbers (no ontology)
    @ec_ontologies_sorted = @ec_ontologies.keys.sort_by{|x|x}.flatten(1)

    # compute EC treeview
    # start constructing the tree from root
    @ec_root = Node.new("-.-.-.-", 'root', nil, '-.-.-.-')
    @ec_root.data['count'] = ec_cross_numbers.select{|ec| ec != []}.length
    ec_last_node =  @ec_root

    # add all ec ontolgy starting from root
    @ec_ontologies.each do |ec, ontology|
      ec_last_node_loop = ec_last_node
      ontology.each do |ec|
        node = Node.find_by_id(ec, @ec_root)
        if node.nil?
          node = Node.new(ec, @ec_functions[ec], @ec_root, ec)
          node.data['count'] = @ec_ontology_count[ec]
          node.data['self_count'] = @ec_self_count.has_key?(ec) ? @ec_self_count[ec] : 0
          ec_last_node_loop = ec_last_node_loop.add_child(node)
        else
          node.name = @ec_functions[ec]
          ec_last_node_loop = node
        end
      end
    end
    @ec_root.sort_children
    @ec_root = Oj.dump(@ec_root, mode: :compat)

    # get lca and common lineage
    @ec_lca_root = EcNumber.calc_ec_lca(JSON.parse(@ec_root), "root")

    # GO retalted stuff
    # variables
    @go_consensus = {}

    # build GO tree
    go_array = @entries.map(&:go_cross_references).flatten.group_by{|go| go.go_term_code}
    go_array.each{|k,v| go_array[k] = v.map(&:uniprot_entry_id)}
    graphs = GoTerm.go_reachability(go_array)
    go_tree_build = GoTerm.go_tree(graphs)

    # GO filter
    GoTerm::GO_ONTOLOGY.keys.each{|o| @go_consensus[o] = []}
    GoTerm::GO_ONTOLOGY.keys.each{|o| GoTerm.cutoff(go_tree_build[o], 0.75*go_tree_build[o].data['count'], @go_consensus[o]) unless go_tree_build[o].nil?}

    # json dump
    @go_root = Oj.dump(go_tree_build, mode: :compat)

    org_tax = {}
    lineage_table = Marshal.load(Marshal.dump(@table_lineages))
    for l in lineage_table do
      organism = l.shift
      l = l.reverse
      l.each do |node|
        if !node.nil? and !org_tax.has_key?(organism)
          org_tax[organism] = node[:name]
        end
      end
    end

    for d in @entries do
      unless d.name.nil?
        taxon_name = org_tax[d.taxon.name].gsub " ", "_"
        d.ec_cross_references.map{|ec| ec.ec_number_code}.each do |ec|
          unless ec.nil?
            @org_ec[ec] = @org_ec.has_key?(ec) ? @org_ec[ec].append(taxon_name) : [taxon_name]
            @org_count[taxon_name] = @org_count.has_key?(taxon_name) ? @org_count[taxon_name] + 1 : 1
          end
        end
      end
    end

    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @entries.to_json(only: :uniprot_accession_number, include: [{ ec_cross_references: { only: :ec_number_code } }, { go_cross_references: { only: :go_term_code } }]) }
      # TODO: switch to OJ for higher performance
      # format.json { render json: Oj.dump(@entries, :include => :name, :mode => :compat) }
    end

  rescue SequenceTooShortError
    flash[:error] = 'The sequence you searched for is too short.'
    redirect_to search_single_url
  rescue NoMatchesFoundError => e
    flash[:error] = "No matches for peptide #{e.message}"
    redirect_to search_single_url
  end

  # Lists all sequences
  def index
    @title = 'All sequences'
    @sequences = Sequence.paginate(page: params[:page])
  end

  # redirects to show
  def search
    if params[:q].empty?
      flash[:error] = 'Your query was empty, please try again.'
      redirect_to search_single_path
    else
      redirect_to "#{sequences_path}/#{params[:q]}/#{params[:il_s]}"
    end
  end

  # processes a list of sequences
  def multi_search
    @header_class = 'MPA'
    # save parameters
    @p = params

    # set search parameters
    @equate_il = params[:il].present?
    filter_duplicates = params[:dupes] == '1'
    handle_missed = params[:missed] == '1'
    export = params[:export] == '1'
    search_name = params[:search_name]
    query = params[:qs]
    csv_string = ''

    # quit if the query was empty
    fail EmptyQueryError if query.blank?

    # remove duplicates, filter shorts, substitute I by L, ...
    data = query.upcase.gsub(/#/, '').gsub(/\P{ASCII}/, '')
    data = data.gsub(/([KR])([^P])/, "\\1\n\\2").gsub(/([KR])([^P])/, "\\1\n\\2") unless handle_missed
    data = data.lines.map(&:strip).to_a.select { |l| l.size >= 5 }
    sequence_mapping = Hash[data.map { |v| @equate_il ? [v.tr('I', 'L'), v] : [v, v] }]
    data = data.map { |s| @equate_il ? s.tr('I', 'L') : s }
    data_counts = Hash[data.group_by { |k| k }.map { |k, v| [k, v.length] }]
    number_searched_for = data.length
    data = data_counts.keys

    # set metrics
    number_searched_for = data.length if filter_duplicates
    @number_found = 0

    # build the resultset
    matches = {}
    misses = data.to_set
    data.each_slice(1000) do |data_slice|
      Sequence.includes(Sequence.lca_t_relation_name(@equate_il) => { lineage: Lineage::ORDER_T }).where(sequence: data_slice).each do |sequence|
        lca_t = sequence.calculate_lca(@equate_il, true)
        unless lca_t.nil?
          num_of_seq = filter_duplicates ? 1 : data_counts[sequence.sequence]
          @number_found += num_of_seq
          matches[lca_t] = [] if matches[lca_t].nil?
          num_of_seq.times do
            matches[lca_t] << sequence_mapping[sequence.sequence]
          end
        end
        misses.delete(sequence.sequence)
      end
    end

    # handle the misses
    if handle_missed
      iter = misses.to_a
      iter.each do |seq|
        sequences = seq.gsub(/([KR])([^P])/, "\\1\n\\2").gsub(/([KR])([^P])/, "\\1\n\\2").lines.map(&:strip).to_a
        next if sequences.size == 1
        # heuristic optimization to evade short sequences with lots of matches
        min_length = [8, sequences.max_by(&:length).length].min
        sequences = sequences.select { |s| s.length >= min_length }

        long_sequences = sequences.map { |s| Sequence.includes(Sequence.peptides_relation_name(@equate_il) => { uniprot_entry: :lineage }).find_by_sequence(s) }

        # jump the loop if we don't have any matches
        next if long_sequences.include? nil
        next if long_sequences.empty?

        # calculate possible uniprot entries
        temp_entries = long_sequences.map { |s| s.peptides(@equate_il).map(&:uniprot_entry).to_set }
        # take the intersection of all sets
        entries = temp_entries.reduce(:&)
        # check if the protein contains the startsequence
        entries.select! { |e| e.protein_contains?(seq, @equate_il) }

        # skip if nothing left
        next if entries.empty?

        seq_lins = entries.map(&:lineage).uniq.compact
        lca_t = Lineage.calculate_lca_taxon(seq_lins) # calculate the LCA

        unless lca_t.nil?
          num_of_seq = filter_duplicates ? 1 : data_counts[seq]
          @number_found += num_of_seq
          matches[lca_t] = [] if matches[lca_t].nil?
          num_of_seq.times do
            matches[lca_t] << sequence_mapping[seq]
          end
        end
        misses.delete(seq)
      end
    end

    # prepare for output
    @title = 'Metaproteomics analysis result'
    @title += ' of ' + search_name unless search_name.nil? || search_name == ''
    @pride_url = "http://www.ebi.ac.uk/pride/archive/assays/#{search_name[/[0-9]*$/]}" if search_name.include? 'PRIDE assay'

    @intro_text = "#{@number_found} out of #{number_searched_for} #{'peptide'.send(number_searched_for != 1 ? :pluralize : :to_s)}  were matched"
    if filter_duplicates || @equate_il
      @intro_text += ' ('
      @intro_text += 'peptides were deduplicated' if filter_duplicates
      @intro_text += ', ' if filter_duplicates && @equate_il
      @intro_text += 'I and L residues were equated' if @equate_il
      @intro_text += ', ' if filter_duplicates || @equate_il
      @intro_text += handle_missed ? 'advanced missed cleavage handling' : 'simple missed cleavage handling'
      @intro_text += ')'
    end
    @intro_text += '.'

    @json_missed = Oj.dump(misses.map { |m| sequence_mapping[m] }.to_a.sort, mode: :compat)

    # construct treemap nodes
    root = Node.new(1, 'Organism', nil, 'no rank')
    matches.each do |taxon, seqs| # for every match
      lca_l = taxon.lineage

      # export stuff
      if export
        seqs.each do |sequence|
          csv_string += CSV.generate_line [sequence].concat(lca_l.to_a)
        end
      end

      last_node_loop = root
      while !lca_l.nil? && lca_l.has_next? # process every rank in lineage
        t = lca_l.next_t
        next if t.nil?
        node = Node.find_by_id(t.id, root)
        if node.nil?
          node = Node.new(t.id, t.name, root, t.rank)
          last_node_loop = last_node_loop.add_child(node)
        else
          last_node_loop = node
        end
      end
      node = taxon.id == 1 ? root : Node.find_by_id(taxon.id, root)
      node.set_sequences(seqs) unless node.nil?
    end

    @json_sequences = Oj.dump(root.sequences, mode: :compat)
    root.prepare_for_multitree unless root.nil?
    root.sort_children unless root.nil?
    @json_tree = Oj.dump(root, mode: :compat)

    if export
      csv_string = CSV.generate_line(['peptide'].concat(Lineage.ranks)) + csv_string

      cookies['nonce'] = params[:nonce]
      filename = search_name != '' ? search_name : 'export'
      send_data csv_string, type: 'text/csv; charset=iso-8859-1; header=present', disposition: 'attachment; filename=' + filename + '.csv'
    end

  rescue EmptyQueryError
    flash[:error] = 'Your query was empty, please try again.'
    redirect_to datasets_path
  end
end

class EmptyQueryError < StandardError; end
