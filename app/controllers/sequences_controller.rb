class SequencesController < ApplicationController
  
  # shows information about a peptide
  # the peptide should be in params[:id] and 
  # can be a peptide id or the sequence itself
  def show
    # params[:id] contains the id
    if params[:id].match(/\A[0-9]+\z/)
      @sequence = Sequence.find_by_id(params[:id])
    else  #params[:id] contains the sequence
      params[:id].gsub!(/I/,'L')
      @sequence = Sequence.find_by_sequence(params[:id])
    end
    
    # error on nil
    if @sequence.nil? || @sequence.peptides.empty?
      flash[:error] = "No matches for peptide #{params[:id]}"
      redirect_to sequences_path
    else
      @title = @sequence.sequence
      
      # get the uniprot entries of every peptide
      @entries = @sequence.peptides.map(&:uniprot_entry)
      
      # LCA calculation
      @lineages = @sequence.lineages #calculate lineages
      @lca_taxon = Lineage.calculate_lca_taxon(@lineages) #calculate the LCA
      @root = Node.new(1, "root") #start constructing the tree
      last_node = @root
      
      #common lineage
      common_lineage = Array.new #construct the common lineage in this array
      l = @lineages[0]
      found = (@lca_taxon.name == "root")
      #this might go wrong in the case where the first lineage doesn't contain the LCA (eg. nil)
      while l.has_next? && !found do
        t = l.next_t
        unless t.nil? then
          found = (@lca_taxon.id == t.id)
          common_lineage << t
          last_node = last_node.add_child(Node.new(t.id, t.name), @root)
        end
      end
      @common_lineage = common_lineage.map(&:name).join(" > ")    
      
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
    	if @root.children.count > 1
    	  @root = @root.to_json
  	  else
  	    @root = @root.children[0].to_json
	    end
	    
	    #Table stuff
	    @table_lineages = Array.new
	    @table_ranks = Array.new
	    
	    @table_lineages << @lineages.map{|lineage| lineage.name.name}
	    @table_ranks << "Name"
	    @lineages.map{|lineage| lineage.set_iterator_position(0)} #reset the iterator
	    while @lineages[0].has_next?
	      temp = @lineages.map{|lineage| lineage.next_t}
	      if temp.compact.length > 0 # don't do anything if it only contains nils
	        @table_lineages << temp
	        @table_ranks << temp.compact[0].rank
	      end
      end
      
      # sort by id from left to right
	    @table_lineages = @table_lineages.transpose.sort_by{ |k| k[1..-1].map!{|l| l || Taxon.find(1)} }
    end
  end
  
  
  # Lists all sequences
  def index
    @title = "All sequences"
    @sequences = Sequence.paginate(:page => params[:page])
  end
  
  
  # redirects to show
  def search
    redirect_to "#{sequences_path}/#{params[:q]}"
  end
  
  # processes a list of sequences
  def multi_search
    @title = "Results"
    
    if params[:q].nil? || params[:q].empty? 
      flash[:error] = "Your query was empty, please try again."
      redirect_to root_path
    else
      # set search parameters
      equate_il = !params[:il].nil?
      filter_duplicates = !params[:dupes].nil?
    
      # remove duplicates, split missed cleavages, substitute I by L, ...
      data = params[:q].gsub(/([KR])([^P\r])/,"\\1\n\\2").gsub(/([KR])([^P\r])/,"\\1\n\\2")
      data = data.gsub(/I/,'L') if equate_il
      data = data.lines.map(&:strip).to_a.select{|l| l.size >= 8 && l.size <= 50 }
      data = data.uniq if filter_duplicates
    
      # set metrics
      @number_searched_for = data.length
      @number_found = 0
    
      # build the resultset
      @matches = Hash.new
      @misses = Array.new
      data.each do |s| # for every sequence in query
        sequence = Sequence.find_by_sequence(s)
        unless sequence.nil?
          @number_found += 1
          lca_t = Lineage.calculate_lca_taxon(sequence.lineages(equate_il))
          @matches[lca_t] = Array.new if @matches[lca_t].nil?
          @matches[lca_t] << sequence.sequence
        else
          @misses << s
        end
      end    
    
      # construct treemap nodes
      @root = TreeMapNode.new(1, "root", "no rank")
      @matches.each do |taxon, sequences| # for every match
        @root.add_sequences(sequences)
        lca_l = Lineage.find_by_taxon_id(taxon.id)
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
    end
  end
end