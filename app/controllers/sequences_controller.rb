class SequencesController < ApplicationController
  require 'oj'

  # shows information about a peptide
  # the peptide should be in params[:id] and
  # can be a peptide id or the sequence itself
  def show
    # process parameters
    # should we equate I and L?
    equate_il = (params[:equate_il] == "equateIL")
    # the sequence or id of the peptide
    seq = params[:id].upcase

    # process the input, convert seq to a valid @sequence
    if seq.match(/\A[0-9]+\z/)
      sequence = Sequence.includes({:peptides => {:uniprot_entry => :name}}).find_by_id(seq)
      @original_sequence = sequence.sequence
    else
      sequence = Sequence.single_search(seq, equate_il)
      @original_sequence = seq
    end

    # quit if it doensn't contain any peptides
    raise NoMatchesFoundError.new(sequence.sequence) if !sequence.nil? && sequence.peptides(equate_il).empty?

    # get the uniprot entries of every peptide
    # only used for the open in uniprot links
    # and calculate the LCA
    unless sequence.nil?
      @entries = sequence.peptides(equate_il).map(&:uniprot_entry)
      @lineages = sequence.lineages(equate_il, true)
    else
      # we didn't find the sequence in the database, so let's try to split it
      long_sequences = Sequence.multi_search(seq, equate_il)
      # calculate possible uniprot entries
      temp_entries = long_sequences.map{|s| s.peptides(equate_il).map(&:uniprot_entry).to_set}
      # take the intersection of all sets
      @entries = temp_entries.reduce(:&)
      # check if the protein contains the startsequence
      @entries.select!{|e| e.protein_contains?(seq, equate_il)}

      raise NoMatchesFoundError.new(seq) if @entries.size == 0
      @lineages = @entries.map(&:lineage).uniq
    end

    @lca_taxon = Lineage.calculate_lca_taxon(@lineages) #calculate the LCA
    @root = Node.new(1, "root") #start constructing the tree
    last_node = @root

    #common lineage
    @common_lineage = Array.new #construct the common lineage in this array
    l = @lca_taxon.lineage
    found = (@lca_taxon.name == "root")
    while !found && l.has_next? do
      t = l.next_t
      unless t.nil?
        found = (@lca_taxon.id == t.id)
        @common_lineage << t
        last_node = last_node.add_child(Node.new(t.id, t.name), @root)
      end
    end

    #distinct lineage
    @lineages.map{|lineage| lineage.set_iterator_position(l.get_iterator_position)}
    @distinct_lineages = Array.new
    @lineages.each do |lineage|
      last_node_loop = last_node
      l = Array.new
      while lineage.has_next?
        t = lineage.next_t
        unless t.nil?
          l << t.name # add the taxon name to de lineage
          node = Node.find_by_id(t.id, @root)
          if node.nil? # if the node isn't create yet
            node = Node.new(t.id, t.name)
            last_node_loop = last_node_loop.add_child(node, @root);
          else
            last_node_loop = node;
          end
        end
      end
      @distinct_lineages << l.join(", ")
    end

    #don't show the root when we don't need it
    @root = @root.children.count > 1 ? Oj.dump(@root) : Oj.dump(@root.children[0])

    #Table stuff
    @table_lineages = Array.new
    @table_ranks = Array.new

    @table_lineages << @lineages.map{|lineage| lineage.name.name}
    @table_ranks << "organism"
    @lineages.map{|lineage| lineage.set_iterator_position(0)} #reset the iterator
    while @lineages[0].has_next?
      temp = @lineages.map{|lineage| lineage.next_t}
      if temp.compact.length > 0 # don't do anything if it only contains nils
        @table_lineages << temp
        @table_ranks << temp.compact[0].rank
      end
    end

    # sort by id from left to right
    root_taxon = Taxon.find(1)
    @table_lineages = @table_lineages.transpose.sort_by{ |k| k[1..-1].map!{|l| l || root_taxon} }

    #sort entries
    @entries = @entries.to_a.sort_by{|e| e.name.nil? ? "" : e.name.name}

    @title = "Tryptic peptide analysis of #{@original_sequence}"

    respond_to do |format|
      format.html # show.html.erb
      format.json { render :json => @entries.to_json(:only => :uniprot_accession_number, :include => [{:ec_cross_references => {:only => :ec_id}}, {:go_cross_references => {:only => :go_id}}]) }
      # TODO: switch to OJ for higher performance
      # format.json { render json: Oj.dump(@entries, :include => :name, :mode => :compat) }
    end

    rescue SequenceTooShortError
      flash[:error] = "The sequence you searched for is too short."
      redirect_to search_single_url
    rescue NoMatchesFoundError => e
      flash[:error] = "No matches for peptide #{e.message}"
      redirect_to search_single_url
  end


  # Lists all sequences
  def index
    @title = "All sequences"
    @sequences = Sequence.paginate(:page => params[:page])
  end


  # redirects to show
  def search
    redirect_to "#{sequences_path}/#{params[:q]}/#{params[:il_s]}"
  end


  # processes a list of sequences
  def multi_search
    # save parameters
    @p = params

    # set search parameters
    @equate_il = !params[:il].nil?
    filter_duplicates = !params[:dupes].nil? && params[:dupes] == "1"
    handle_missed = !params[:missed].nil? && params[:missed] == "1"
    export = !params[:export].nil? && params[:export] == "1"
    search_name = params[:search_name]
    query = params[:qs]

    @title = "Multi-peptide analysis result"
    @title += " of " + search_name unless search_name.nil? || search_name == ""
    if search_name.include? "Pride experiment"
      @prideURL = "http://www.ebi.ac.uk/pride/experiment.do?experimentAccessionNumber=#{search_name[/[0-9]*$/]}"
    end

    # quit if the query was empty
    raise EmptyQueryError.new if query.nil? || query.empty?

    #export stuff
    csv_string = CSV.generate_line ["peptide"].concat(Lineage.ranks) if export

    # remove duplicates, filter shorts, substitute I by L, ...
    data = query.upcase
    data = data.gsub(/I/,'L') if @equate_il
    data = data.gsub(/([KR])([^P])/,"\\1\n\\2").gsub(/([KR])([^P])/,"\\1\n\\2") unless handle_missed
    data = data.lines.map(&:strip).to_a.select{|l| l.size >= 5}
    data_counts = Hash[data.group_by{|k| k}.map{|k,v| [k, v.length]}]
    number_searched_for = data.length
    data = data_counts.keys

    # set metrics
    number_searched_for = data.length if filter_duplicates
    @number_found = 0

    # build the resultset
    @matches = Hash.new
    @misses = data.to_set
    if @equate_il
      sequences = Sequence.includes({:lca_il_t => {:lineage => [:superkingdom_t, :kingdom_t, :subkingdom_t, :superphylum_t, :phylum_t, :subphylum_t, :superclass_t, :class_t, :subclass_t, :infraclass_t, :superorder_t, :order_t, :suborder_t, :infraorder_t, :parvorder_t, :superfamily_t, :family_t, :subfamily_t, :tribe_t, :subtribe_t, :genus_t, :subgenus_t, :species_group_t, :species_subgroup_t, :species_t, :subspecies_t, :varietas_t, :forma_t]}}).where(sequence: data)
    else
      sequences = Sequence.includes({:lca_t => {:lineage => [:superkingdom_t, :kingdom_t, :subkingdom_t, :superphylum_t, :phylum_t, :subphylum_t, :superclass_t, :class_t, :subclass_t, :infraclass_t, :superorder_t, :order_t, :suborder_t, :infraorder_t, :parvorder_t, :superfamily_t, :family_t, :subfamily_t, :tribe_t, :subtribe_t, :genus_t, :subgenus_t, :species_group_t, :species_subgroup_t, :species_t, :subspecies_t, :varietas_t, :forma_t]}}).where(sequence: data)
    end
    sequences.each do |sequence| # for every sequence in query
      lca_t = sequence.calculate_lca(@equate_il, true)
      unless lca_t.nil?
        num_of_seq = filter_duplicates ? 1 : data_counts[sequence.sequence]
        @number_found += num_of_seq
        @matches[lca_t] = Array.new if @matches[lca_t].nil?
        num_of_seq.times do
          @matches[lca_t] << sequence.sequence
        end
      end
      @misses.delete(sequence.sequence)
    end

    # handle the misses
    if handle_missed
      iter = @misses.to_a
      iter.each do |seq|
        sequences = seq.gsub(/([KR])([^P])/,"\\1\n\\2").gsub(/([KR])([^P])/,"\\1\n\\2").lines.map(&:strip).to_a
        next if sequences.size == 1
        sequences = sequences.select{|s| s.length >= 5}
        if sequences.select{|s| s.length >= 8}.length >=1
          sequences = sequences.select{|s| s.length >= 8}
        elsif sequences.select{|s| s.length >= 7}.length >=1
          sequences = sequences.select{|s| s.length >= 7}
        elsif sequences.select{|s| s.length >= 6}.length >=1
          sequences = sequences.select{|s| s.length >= 6}
        end

        if @equate_il
          long_sequences = sequences.map{|s| Sequence.find_by_sequence(s, :include => {:peptides => {:uniprot_entry => :lineage}})}
        else
          long_sequences = sequences.map{|s| Sequence.find_by_sequence(s, :include => {:original_peptides => {:uniprot_entry => :lineage}})}
        end

        # jump the loop
        next if long_sequences.include? nil
        next if long_sequences.size == 0

        # calculate possible uniprot entries
        temp_entries = long_sequences.map{|s| s.peptides(@equate_il).map(&:uniprot_entry).to_set}
        # take the intersection of all sets
        entries = temp_entries.reduce(:&)
        # check if the protein contains the startsequence
        entries.select!{|e| e.protein_contains?(seq, equate_il)}

        # skip if nothing left
        next if entries.size == 0

        seq_lins = entries.map(&:lineage).uniq.compact
        lca_t = Lineage.calculate_lca_taxon(seq_lins) #calculate the LCA

        unless lca_t.nil?
          num_of_seq = filter_duplicates ? 1 : data_counts[seq]
          @number_found += num_of_seq
          @matches[lca_t] = Array.new if @matches[lca_t].nil?
          num_of_seq.times do
            @matches[lca_t] << seq
          end
        end
        @misses.delete(seq)

      end
    end
    @misses = @misses.to_a.sort

    @intro_text = "#{@number_found} out of #{number_searched_for} #{"peptide".send(number_searched_for != 1 ? :pluralize : :to_s)}  were matched"
    if filter_duplicates || @equate_il
      @intro_text += " ("
      @intro_text += "peptides were deduplicated" if filter_duplicates
      @intro_text += ", " if filter_duplicates && @equate_il
      @intro_text += "I and L residues were equated" if @equate_il
      @intro_text += ", " if filter_duplicates || @equate_il
      @intro_text += handle_missed ? "advanced missed cleavage handling" : "simple missed cleavage handling"
      @intro_text += ")"
    end
    @intro_text += "."

    # construct treemap nodes
    @root = TreeMapNode.new(1, "organism", "no rank")
    @matches.each do |taxon, sequences| # for every match
      @root.add_sequences(sequences)
      lca_l = taxon.lineage

      #export stuff
      if export
        sequences.each do |sequence|
          csv_string += CSV.generate_line [sequence].concat(lca_l.to_a)
        end
      end

      last_node_loop = @root
      while !lca_l.nil? && lca_l.has_next? # process every rank in lineage
        t = lca_l.next_t
        unless t.nil?
          node = TreeMapNode.find_by_id(t.id, @root)
          if node.nil?
            node = TreeMapNode.new(t.id, t.name, t.rank)
            last_node_loop = last_node_loop.add_child(node, @root)
          else
            last_node_loop = node
          end
          node.add_sequences(sequences)
        end
      end
      node = taxon.id == 1 ? @root : TreeMapNode.find_by_id(taxon.id, @root)
      node.add_own_sequences(sequences) unless node.nil?
    end

    #don't show the root when we don't need it
    @root = @root.children[0] if @root.children.count == 0
    @root.add_piechart_data unless @root.nil?
    @root.sort_peptides_and_children unless @root.nil?

    root_json = Oj.dump(@root, mode: :compat)
    sunburst_hash = Oj.load(String.new(root_json))
    TreeMapNode.clean_sunburst!(sunburst_hash) unless sunburst_hash.nil?
    @sunburst_json = Oj.dump(sunburst_hash).gsub("children","kids")

    treemap_hash = Oj.load(root_json)
    TreeMapNode.clean_treemap!(treemap_hash) unless treemap_hash.nil?
    @treemap_json = Oj.dump(treemap_hash)


    #more export stuff
    if export
      cookies['nonce'] = params[:nonce]
      filename = search_name != "" ? search_name : "export"
      send_data csv_string, :type => 'text/csv; charset=iso-8859-1; header=present', :disposition => "attachment; filename="+filename+".csv"
    end

    rescue EmptyQueryError
      flash[:error] = "Your query was empty, please try again."
      redirect_to datasets_path
  end
end

class EmptyQueryError < StandardError; end
