class SequencesController < ApplicationController
  require 'oj'
  
  # shows information about a peptide
  # the peptide should be in params[:id] and 
  # can be a peptide id or the sequence itself
  def show
    # process parameters
    # should we equate I and L?
    equate_il = ( params[:equate_il].nil? || params[:equate_il] != "false" )
    # the sequence or id of the peptide
    seq = params[:id].upcase
    
    
    # process the input, convert seq to a valid @sequence
    # seq contains the id of the sequence
    if seq.match(/\A[0-9]+\z/) 
      sequence = Sequence.find_by_id(seq, :include => {:peptides => {:uniprot_entry => :name}})  
    # seq contains the sequence
    else
      seq.gsub!(/I/,'L') if equate_il
      raise SequenceTooShortError if seq.length < 5
      # try finding it in the database
      sequence = Sequence.find_by_sequence(seq, :include => {:peptides => {:uniprot_entry => :name}})
    end
    
    # we didn't find the sequence in the database
    # don't panic, we still got a few aces up our sleeve
    if sequence.nil?
      # check if it's splitable
      raise NoMatchesFoundError.new(seq) if seq.index(/([KR])([^P])/).nil?
      
      # split it
      sequences = seq.gsub(/([KR])([^P])/,"\\1\n\\2").gsub(/([KR])([^P])/,"\\1\n\\2").lines.map(&:strip).to_a
      if equate_il
        long_sequences = sequences.select{|s| s.length >= 5}.map{|s| Sequence.find_by_sequence(s, :include => {:peptides => {:uniprot_entry => [:name, :lineage]}})}
      else
        long_sequences = sequences.select{|s| s.length >= 5}.map{|s| Sequence.find_by_sequence(s, :include => {:original_peptides => {:uniprot_entry => [:name, :lineage]}})}
      end
      
      # check if it has a match for every sequence and at least one long part
      raise NoMatchesFoundError.new(seq) if long_sequences.include? nil
      raise SequenceTooShortError if long_sequences.size == 0
      
      # ok, we're done
      @sequence_string = seq
      multi = true
      
    # we did find something in the database, but will it blend?
    else
      # check if we have some peptides to work with
      if (sequence.peptides.empty? && equate_il) || (sequence.original_peptides.empty? && !equate_il)
        raise NoMatchesFoundError.new(sequence.sequence)
      end
      @sequence_string = sequence.sequence
    end
    
    @title = "Tryptic peptide analysis of #{@sequence_string}"
    
    # get the uniprot entries of every peptide
    # only used for the open in uniprot links
    if multi
      # calculate possible uniprot entries
      if equate_il
        temp_entries = long_sequences.map{|s| s.peptides.map(&:uniprot_entry)}
      else
        temp_entries = long_sequences.map{|s| s.original_peptides.map(&:uniprot_entry)}
      end
      
      # take the intersection of all sets
      @entries = temp_entries[0]
      for i in 1..(temp_entries.size-1) do
        @entries = @entries & temp_entries[i]
      end
      
      # check if the protein contains the startsequence
      if equate_il
        @entries.select!{|e| e.protein.gsub(/I/,'L').include? seq}
      else
        @entries.select!{|e| e.protein.include? seq}
      end
      raise NoMatchesFoundError.new(seq) if @entries.size == 0 
    else
      @entries = equate_il ? sequence.peptides.map(&:uniprot_entry) : sequence.original_peptides.map(&:uniprot_entry)
    end
    
    
    # LCA calculation
    if multi
      @lineages = @entries.map(&:lineage).uniq
    else
      @lineages = sequence.lineages(equate_il, true)
    end
    @lca_taxon = Lineage.calculate_lca_taxon(@lineages) #calculate the LCA
    @root = Node.new(1, "root") #start constructing the tree
    last_node = @root
    
    #common lineage
    @common_lineage = Array.new #construct the common lineage in this array
    l = @lineages.select{|lineage| lineage[@lca_taxon.rank] == @lca_taxon.id}.first
    l = @lineages.first if l.nil?
    found = (@lca_taxon.name == "root")
    #this might go wrong in the case where the first lineage doesn't contain the LCA (eg. nil)
    while l.has_next? && !found do
      t = l.next_t
      unless t.nil? then
        found = (@lca_taxon.id == t.id)
        @common_lineage << t
        last_node = last_node.add_child(Node.new(t.id, t.name), @root)
      end
    end
    
    #distinct lineage 
    @lineages.map{|lineage| lineage.set_iterator_position(l.get_iterator_position)}
    @distinct_lineages = Array.new
    for lineage in @lineages do
      last_node_loop = last_node
      l = Array.new
      while lineage.has_next?
        t = lineage.next_t
        unless t.nil? then
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
    @table_lineages = @table_lineages.transpose.sort_by{ |k| k[1..-1].map!{|l| l || root_taxon} }
    	
    #sort entries
    @entries.sort_by!{|e| e.name.name}
    
  rescue SequenceTooShortError
    flash[:error] = "The sequence you searched for is too short."
    redirect_to sequences_path
  rescue NoMatchesFoundError => e
      flash[:error] = "No matches for peptide #{e.message}"
      redirect_to sequences_path
  end
  
  
  # Lists all sequences
  def index
    @title = "All sequences"
    @sequences = Sequence.paginate(:page => params[:page])
  end
  
  
  # redirects to show
  def search
    il = ( params[:il_s] == 1 || params[:il_s] == "1" )
    redirect_to "#{sequences_path}/#{params[:q]}/#{il}"
  end
  
  # processes a list of sequences
  def multi_search
    # set search parameters
    @equate_il = !params[:il].nil?
    filter_duplicates = !params[:dupes].nil?
    export = !params[:export].nil?
    search_name = params[:search_name]
    query = params[:qs]
    
    @title = "Multi-peptide analysis result"
    @title += " of " + search_name unless search_name.nil? || search_name == ""
  
    if query.nil? || query.empty? 
      flash[:error] = "Your query was empty, please try again."
      redirect_to root_path
    else
      #export stuff
      csv_string = CSV.generate_line ["peptide"].concat(Lineage.ranks) if export
    
      # remove duplicates, filter shorts, substitute I by L, ...
      data = query.upcase.gsub(/I/,'L') if @equate_il
      data = data.lines.map(&:strip).to_a.select{|l| l.size >= 5}
      data = data.uniq if filter_duplicates
    
      # set metrics
      number_searched_for = data.length
      @number_found = 0
    
      # build the resultset
      @matches = Hash.new
      @misses = data
      logger.debug misses.size
      logger.debug misses
      if @equate_il
        sequences = Sequence.find_all_by_sequence(data, :include => {:lca_il_t => {:lineage => [:superkingdom_t, :kingdom_t, :subkingdom_t, :superphylum_t, :phylum_t, :subphylum_t, :superclass_t, :class_t, :subclass_t, :infraclass_t, :superorder_t, :order_t, :suborder_t, :infraorder_t, :parvorder_t, :superfamily_t, :family_t, :subfamily_t, :tribe_t, :subtribe_t, :genus_t, :subgenus_t, :species_group_t, :species_subgroup_t, :species_t, :subspecies_t, :varietas_t, :forma_t]}})
      else
        sequences = Sequence.find_all_by_sequence(data, :include => {:lca_t => {:lineage => [:superkingdom_t, :kingdom_t, :subkingdom_t, :superphylum_t, :phylum_t, :subphylum_t, :superclass_t, :class_t, :subclass_t, :infraclass_t, :superorder_t, :order_t, :suborder_t, :infraorder_t, :parvorder_t, :superfamily_t, :family_t, :subfamily_t, :tribe_t, :subtribe_t, :genus_t, :subgenus_t, :species_group_t, :species_subgroup_t, :species_t, :subspecies_t, :varietas_t, :forma_t]}})
      end
      sequences.each do |sequence| # for every sequence in query
        lca_t = sequence.calculate_lca(@equate_il, true)
        unless lca_t.nil?
          @number_found += 1
          @matches[lca_t] = Array.new if @matches[lca_t].nil?
          @matches[lca_t] << sequence.sequence
        end
        @misses.delete(sequence.sequence)
      end  
      
      # handle the misses
      logger.debug misses.size
      logger.debug misses
      for seq in @misses
        logger.debug seq
        sequences = seq.gsub(/([KR])([^P])/,"\\1\n\\2").gsub(/([KR])([^P])/,"\\1\n\\2").lines.map(&:strip).to_a
        logger.debug sequences.to_s if seq=="AEAHLKAGAR"
        next if sequences.size == 1
        if @equate_il
          long_sequences = sequences.select{|s| s.length >= 5}.map{|s| Sequence.find_by_sequence(s, :include => {:peptides => {:uniprot_entry => [:name, :lineage]}})}
          logger.debug long_sequences.to_s if seq=="AEAHLKAGAR"
        else
          long_sequences = sequences.select{|s| s.length >= 5}.map{|s| Sequence.find_by_sequence(s, :include => {:original_peptides => {:uniprot_entry => [:name, :lineage]}})}
        end
        
        # jump the loop
        next if long_sequences.include? nil
        next if long_sequences.size == 0
        
        # calculate possible uniprot entries
        if @equate_il
          temp_entries = long_sequences.map{|s| s.peptides.map(&:uniprot_entry)}
          logger.debug temp_entries.to_s if seq=="AEAHLKAGAR"
        else
          temp_entries = long_sequences.map{|s| s.original_peptides.map(&:uniprot_entry)}
        end

        # take the intersection of all sets
        entries = temp_entries[0]
        for i in 1..(temp_entries.size-1) do
          entries = entries & temp_entries[i]
        end
        logger.debug entries.to_s if seq=="AEAHLKAGAR"

        # check if the protein contains the startsequence
        if @equate_il
          entries.select!{|e| e.protein.gsub(/I/,'L').include? seq}
          logger.debug entries.to_s if seq=="AEAHLKAGAR"
        else
          entries.select!{|e| e.protein.include? seq}
        end
        
        # skip if nothing left
        next if entries.size == 0
        
        seq_lins = entries.map(&:lineage).uniq
        logger.debug seq_lins.to_s if seq=="AEAHLKAGAR"
        lca_t = Lineage.calculate_lca_taxon(seq_lins) #calculate the LCA
        logger.debug lca_t.to_s if seq=="AEAHLKAGAR"
        
        unless lca_t.nil?
          @number_found += 1
          @matches[lca_t] = Array.new if @matches[lca_t].nil?
          @matches[lca_t] << seq
        end
        @misses.delete(seq)
        
      end
      
      @misses.sort! 
      
      @intro_text = "#{@number_found} out of #{number_searched_for} #{"peptide".send(number_searched_for != 1 ? :pluralize : :to_s)}  were matched"
      if filter_duplicates || @equate_il 
        @intro_text += " ("
        @intro_text += "peptides were deduplicated" if filter_duplicates
        @intro_text += ", " if filter_duplicates && @equate_il 
        @intro_text += "I and L residues were equated" if @equate_il
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
          for sequence in sequences do
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
    	    	
    	root_json = Oj.dump(@root).gsub('"^o":"TreeMapNode",', "")
    	sunburst_hash = Oj.load(String.new(root_json))
    	TreeMapNode.clean_sunburst!(sunburst_hash) unless sunburst_hash.nil?
    	@sunburst_json = Oj.dump(sunburst_hash).gsub("children","kids")
    	
    	treemap_hash = Oj.load(root_json)
    	TreeMapNode.clean_treemap!(treemap_hash) unless treemap_hash.nil?
    	@treemap_json = Oj.dump(treemap_hash)
    	
    	
    	#more export stuff
    	filename = search_name != "" ? search_name : "export"
      send_data csv_string, :type => 'text/csv; charset=iso-8859-1; header=present', :disposition => "attachment; filename="+filename+".csv" if export
      
    end
  end
end

#some errors
class SequenceTooShortError < StandardError; end
class NoMatchesFoundError < StandardError; end
