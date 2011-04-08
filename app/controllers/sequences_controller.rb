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
      found = false
      while l.has_next? && !found do
        t = Taxon.find_by_id(l.next)
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
    			rank = lineage.next
    			unless rank.nil? then
    			  t = Taxon.find_by_id(rank)
    			  l << t.name
    			  node = Node.find_by_id(rank)
    			  node = Node.new(t.id, t.name) if node.nil?
    			  last_node_loop = last_node_loop.add_child(node);
    			end
    		end
    		@distinct_lineages << l.join(", ")
    	end
    	@root = @root.to_json
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
end