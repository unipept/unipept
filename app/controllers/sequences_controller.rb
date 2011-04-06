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
      resultset = @sequence.occurrences
      
      @number_of_species = resultset.num_rows
      @genera = Array.new
      @species = Hash.new
      resultset.each_hash do |row|
        g = @species[row["genus"]]
        if g.nil?
          @genera << row["genus"]
          @species[row["genus"]] = [row]
        else
          @species[row["genus"]] << row
        end
      end
      #@genera.sort!
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
  
  
  # tries to show the LCA of the peptide in params[:q]
  def search2
    # id or sequence?
    if params[:q].match(/\A[0-9]+\z/)
      @sequence = Sequence.find_by_id(params[:q])
    else  
      @sequence = Sequence.find_by_sequence(params[:q])
    end
    
    # error on nil
    if @sequence.nil?
      flash[:error] = "No matches for #{params[:q]}"
      redirect_to sequences_path
    else
      @title = @sequence.sequence
      
      #try to determine the LCA
      @lineages = @sequence.lineages
      @lca_taxon = Lineage.calculate_lca_taxon(@lineages)
      
    end
    
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
      unless sequence.nil? || (!params[:drafts] && sequence.peptides.map(&:organism).map(&:draft).count("\x00") == 0)
        @number_found += 1
        if(params[:drafts])
          resultset = sequence.occurrences(true)
        else
          resultset = sequence.occurrences(false)
        end
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