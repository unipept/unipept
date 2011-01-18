class SequencesController < ApplicationController

  def show
    #id or sequence?
    if params[:id].match(/\A[0-9]+\z/)
      @sequence = Sequence.find_by_id(params[:id])
    else  
      @sequence = Sequence.find_by_sequence(params[:id])
    end
    
    #error on nil
    if @sequence.nil?
      flash[:error] = "No matches for #{params[:id]}"
      redirect_to sequences_path
    else
      @title = @sequence.sequence
      resultset = ActiveRecord::Base.connection.execute("SELECT genus.name AS genus, species.name AS species, query.genus_id, query.species_id AS species_id, genomes_with_sequence, number_of_genomes FROM (SELECT sequence_id, species_id, genus_id, COUNT(DISTINCT organism_id) AS genomes_with_sequence FROM unipept.peptides INNER JOIN unipept.organisms ON (organisms.id = peptides.organism_id) WHERE peptides.sequence_id = #{@sequence.id} GROUP BY sequence_id, species_id) AS query INNER JOIN (SELECT species_id, COUNT(*) AS number_of_genomes FROM unipept.organisms GROUP BY species_id) AS numbers ON (query.species_id = numbers.species_id) INNER JOIN unipept.taxon_names AS species ON (query.species_id = species.tax_id) INNER JOIN unipept.taxon_names AS genus ON (query.genus_id = genus.tax_id) WHERE species.nameClass='scientific name' AND genus.nameClass='scientific name'")
      
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
      @genera.sort!
    end
  end
  
  def index
    @title = "All sequences"
    @sequences = Sequence.paginate(:page => params[:page])
  end
  
  def search
    redirect_to "#{sequences_path}/#{params[:q]}"
  end
end