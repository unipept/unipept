class PancoreproteomeController < ApplicationController
  
  def analyze
    if params[:species_id]
      refseqs = ActiveRecord::Base.connection.select_rows("select distinct straight_join bioproject_id, name, sequence_id from lineages left join uniprot_entries on lineages.taxon_id = uniprot_entries.taxon_id  left join refseq_cross_references on uniprot_entry_id = uniprot_entries.id  left join genomes on sequence_id = genomes.refseq_id  where species = #{params[:species_id]} and refseq_id IS NOT NULL")
      @cores = Array.new
      @pans = Array.new
      @genomes = Array.new
      pan = Set.new
      core = nil
      refseqs.each do|r|
        logger.debug r
        @genomes << r[1]
        result = ActiveRecord::Base.connection.select_values("SELECT original_sequence_id FROM peptides LEFT JOIN  refseq_cross_references ON peptides.uniprot_entry_id = refseq_cross_references.uniprot_entry_id WHERE refseq_cross_references.sequence_id = '#{r[2]}'").to_set
        pan |= result
        if core.nil?
          core = result
        else
          core &= result
        end
        @cores << core.size
        @pans << pan.size
      end
    else
      @genomes = ["Bacillus cereus ATCC 14579","Bacillus cereus ATCC 10987","Bacillus cereus E33L","Bacillus cereus NC7401","Bacillus cereus F837/76","Bacillus cereus Q1","Bacillus cereus G9842","Bacillus cereus B4264","Bacillus cereus AH187","Bacillus cereus AH820","Bacillus cereus 03BB102","Bacillus cereus biovar anthracis str. CI"]
      @cores = [92529, 45041, 39468, 37670, 36692, 34186, 33276, 32676, 31996, 31424, 31367, 30952]
      @pans = [92529, 138046, 168711, 187823, 204437, 226265, 240912, 247543, 258817, 266792, 267728, 273056]
    end
    
  end

end