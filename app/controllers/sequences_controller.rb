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
      sequence = Sequence.includes({:peptides => {:uniprot_entry => [:name, :ec_cross_references, :go_cross_references]}}).find_by_id(seq)
      @original_sequence = sequence.sequence
    else
      sequence = Sequence.single_search(seq, equate_il)
      @original_sequence = seq
    end

    # quit if it doensn't contain any peptides
    raise NoMatchesFoundError.new(sequence.sequence) if sequence.present? && sequence.peptides(equate_il).empty?

    # get the uniprot entries of every peptide
    # only used for the open in uniprot links
    # and calculate the LCA
    unless sequence.nil?
      @entries = sequence.peptides(equate_il).map(&:uniprot_entry)
      @lineages = sequence.lineages(equate_il, true)
    else
      # we didn't find the sequence in the database, so let's try to split it
      long_sequences = Sequence.advanced_single_search(seq, equate_il)
      # calculate possible uniprot entries
      temp_entries = long_sequences.map{|s| s.peptides(equate_il).map(&:uniprot_entry).to_set}
      # take the intersection of all sets
      @entries = temp_entries.reduce(:&)
      # check if the protein contains the startsequence
      @entries.select!{|e| e.protein_contains?(seq, equate_il)}

      raise NoMatchesFoundError.new(seq) if @entries.empty?
      @lineages = @entries.map(&:lineage).compact
    end

    @lca_taxon = Lineage.calculate_lca_taxon(@lineages) #calculate the LCA
    @root = Node.new(1, "Organism", nil, "root") #start constructing the tree
    @root.data["count"] = @lineages.size
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
        node = Node.new(t.id, t.name, @root)
        node.data["count"] = @lineages.size
        last_node = last_node.add_child(node)
      end
    end

    #distinct lineage
    @lineages.map{|lineage| lineage.set_iterator_position(l.get_iterator_position)}
    @lineages.each do |lineage|
      last_node_loop = last_node
      l = Array.new
      while lineage.has_next?
        t = lineage.next_t
        unless t.nil?
          l << t.name # add the taxon name to the lineage
          node = Node.find_by_id(t.id, @root)
          if node.nil? # if the node isn't create yet
            node = Node.new(t.id, t.name, @root, t.rank)
            node.data["count"] = 1
            last_node_loop = last_node_loop.add_child(node)
          else
            node.data["count"] += 1
            last_node_loop = node;
          end
        end
      end
    end

    #don't show the root when we don't need it
    @root.sort_children
    @root = Oj.dump(@root, mode: :compat)

    #Table stuff
    @table_lineages = Array.new
    @table_ranks = Array.new

    @lineages = @lineages.uniq
    @table_lineages << @lineages.map{|lineage| lineage.name.name}
    @table_ranks << "Organism"
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
    @table_lineages = @table_lineages.transpose.sort_by{ |k| k[1..-1].map!{|lin| lin || root_taxon} }

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
    @equate_il = params[:il].present?
    filter_duplicates = params[:dupes] == "1"
    handle_missed = params[:missed] == "1"
    export = params[:export] == "1"
    search_name = params[:search_name]
    query = params[:qs]
    csv_string = ""

    # quit if the query was empty
    raise EmptyQueryError.new if query.blank?

    # remove duplicates, filter shorts, substitute I by L, ...
    data = query.upcase.gsub(/#/,"")
    data = data.gsub(/([KR])([^P])/,"\\1\n\\2").gsub(/([KR])([^P])/,"\\1\n\\2") unless handle_missed
    data = data.lines.map(&:strip).to_a.select{|l| l.size >= 5}
    sequence_mapping = Hash[data.map{|v| @equate_il ? [v.gsub(/I/,'L'), v] : [v, v]}]
    data = data.map{|s| @equate_il ? s.gsub(/I/,'L') : s}
    data_counts = Hash[data.group_by{|k| k}.map{|k,v| [k, v.length]}]
    number_searched_for = data.length
    data = data_counts.keys

    # set metrics
    number_searched_for = data.length if filter_duplicates
    @number_found = 0

    # build the resultset
    matches = Hash.new
    misses = data.to_set
    data.each_slice(1000) do |data_slice|
      Sequence.includes({Sequence.lca_t_relation_name(@equate_il) => {:lineage => Lineage::ORDER_T}}).where(sequence: data_slice).each do |sequence|
        lca_t = sequence.calculate_lca(@equate_il, true)
        unless lca_t.nil?
          num_of_seq = filter_duplicates ? 1 : data_counts[sequence.sequence]
          @number_found += num_of_seq
          matches[lca_t] = Array.new if matches[lca_t].nil?
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
        sequences = seq.gsub(/([KR])([^P])/,"\\1\n\\2").gsub(/([KR])([^P])/,"\\1\n\\2").lines.map(&:strip).to_a
        next if sequences.size == 1
        # heuristic optimization to evade short sequences with lots of matches
        min_length = [8, sequences.max_by { |s| s.length }.length].min
        sequences = sequences.select {|s| s.length >= min_length}

        long_sequences = sequences.map{|s| Sequence.includes({Sequence.peptides_relation_name(@equate_il) => {:uniprot_entry => :lineage}}).find_by_sequence(s)}

        # jump the loop if we don't have any matches
        next if long_sequences.include? nil
        next if long_sequences.empty?

        # calculate possible uniprot entries
        temp_entries = long_sequences.map{|s| s.peptides(@equate_il).map(&:uniprot_entry).to_set}
        # take the intersection of all sets
        entries = temp_entries.reduce(:&)
        # check if the protein contains the startsequence
        entries.select!{|e| e.protein_contains?(seq, @equate_il)}

        # skip if nothing left
        next if entries.empty?

        seq_lins = entries.map(&:lineage).uniq.compact
        lca_t = Lineage.calculate_lca_taxon(seq_lins) #calculate the LCA

        unless lca_t.nil?
          num_of_seq = filter_duplicates ? 1 : data_counts[seq]
          @number_found += num_of_seq
          matches[lca_t] = Array.new if matches[lca_t].nil?
          num_of_seq.times do
            matches[lca_t] << sequence_mapping[seq]
          end
        end
        misses.delete(seq)
      end
    end

    # prepare for output
    @title = "Metaproteomics analysis result"
    @title += " of " + search_name unless search_name.nil? || search_name == ""
    @prideURL = "http://www.ebi.ac.uk/pride/archive/assays/#{search_name[/[0-9]*$/]}" if search_name.include? "PRIDE assay"

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

    @json_missed = Oj.dump(misses.map{|m| sequence_mapping[m]}.to_a.sort, mode: :compat)

    # construct treemap nodes
    root = Node.new(1, "Organism", nil, "no rank")
    matches.each do |taxon, seqs| # for every match
      lca_l = taxon.lineage

      #export stuff
      if export
        seqs.each do |sequence|
          csv_string += CSV.generate_line [sequence].concat(lca_l.to_a)
        end
      end

      last_node_loop = root
      while !lca_l.nil? && lca_l.has_next? # process every rank in lineage
        t = lca_l.next_t
        unless t.nil?
          node = Node.find_by_id(t.id, root)
          if node.nil?
            node = Node.new(t.id, t.name, root, t.rank)
            last_node_loop = last_node_loop.add_child(node)
          else
            last_node_loop = node
          end
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
      csv_string = CSV.generate_line(["peptide"].concat(Lineage.ranks)) + csv_string

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
