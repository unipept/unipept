class SequencesController < ApplicationController
  
  # shows information about a peptide
  # the peptide should be in params[:id] and 
  # can be a peptide id or the sequence itself
  def show
    # id or sequence?
    if params[:id].match(/\A[0-9]+\z/)
      @sequence = Sequence.find_by_id(params[:id])
    else  
      @sequence = Sequence.find_by_sequence(params[:id])
    end
    
    # error on nil
    if @sequence.nil?
      flash[:error] = "No matches for #{params[:id]}"
      redirect_to sequences_path
    else
      @title = @sequence.sequence
      
      #try to determine the LCA
      @lineages = @sequence.lineages
      @lca_taxon = Lineage.calculate_lca_taxon(@lineages)
      @root = Node.new(0, "root")
      last_node = @root
      
      #common lineage
      common_lineage = Array.new
      l = @lineages[0]
      found = (@lca_taxon.name == "root")
      while l.has_next? && !found do
        t = l.next_t
        unless t.nil? then
          found = (@lca_taxon.id == t.id)
          common_lineage << t
          last_node = last_node.add_child(Node.new(t.id, t.name))
        end
      end
      @common_lineage = common_lineage.map(&:name).join(", ")    
      
      #distinct lineage 
      @lineages.map{|lineage| lineage.set_iterator_position(l.get_iterator_position)}
      @distinct_lineages = Array.new
      for lineage in @lineages do
        last_node_loop = last_node
        l = Array.new
    		while lineage.has_next?
    			t = lineage.next_t
    			unless t.nil? then
    			  l << t.name
    			  node = Node.find_by_id(t.id)
    			  if node.nil?
    			    node = Node.new(t.id, t.name)
    			    last_node_loop = last_node_loop.add_child(node);
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
    
    # remove duplicates, split missed cleavages, substitute I by L
    data = params[:q][0].gsub(/([KR])([^P\r])/,"\\1\n\\2").gsub(/I/,'L').lines.map(&:strip).to_a.uniq
    
    @number_searched_for = data.length
    @number_found = 0
    @number_unique_found = 0
    
    # build the resultset
    @matches = Hash.new
    @species = Array.new
    data.each do |s|
      sequence = Sequence.find_by_sequence(s)
      unless sequence.nil? || (!params[:drafts] && sequence.peptides.map(&:genbank_file).map(&:draft).count("\x00") == 0)
        @number_found += 1
        resultset = sequence.occurrences(params[:drafts])
        if resultset.num_rows == 1
          @number_unique_found += 1
          hash = resultset.fetch_hash
          hash["sequence"] = sequence
          s = @matches[hash["species"]]
          if s.nil?
            @species << hash["species"]
            @matches[hash["species"]] = [hash]
          else
            @matches[hash["species"]] << hash
          end
        end
      end
    end
    @species.sort!
  end
  
  # processes a list of sequences
  def multi_search2
    @title = "Test results"
    
    # remove duplicates, split missed cleavages, substitute I by L
    data = params[:q][0].gsub(/([KR])([^P\r])/,"\\1\n\\2").gsub(/I/,'L').lines.map(&:strip).to_a.uniq
    
    @number_searched_for = data.length
    @number_found = 0
    
    # build the resultset
    @matches = Hash.new
    data.each do |s|
      sequence = Sequence.find_by_sequence(s)
      unless sequence.nil? || (!params[:drafts] && sequence.peptides.map(&:genbank_file).map(&:draft).count("\x00") == 0)
        @number_found += 1
        lca_t = Lineage.calculate_lca_taxon(sequence.lineages)
        @matches[lca_t] = 0 if @matches[lca_t].nil?
        @matches[lca_t] += 1
      end
    end    
    
    #treemap stuff
    @root = Node.new(0, "root")
    @matches.each do |taxon, number|    
      lca_l = Lineage.find_by_taxon_id(taxon.id)
      last_node_loop = @root
      while !lca_l.nil? && lca_l.has_next?
        t = lca_l.next_t
        unless t.nil?
          node = Node.find_by_id(t.id)
    		  if node.nil?
    		    node = Node.new(t.id, t.name)
    		    last_node_loop = last_node_loop.add_child(node);
    	    else
    	      last_node_loop = node;
          end
          node.add_count(number);
        end
      end
    end
  	#don't show the root when we don't need it
  	if @root.children.count > 1
  	  @root = @root.to_json
	  else
	    @root = @root.children[0].to_json
    end
  end
end