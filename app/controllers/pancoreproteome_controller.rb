class PancoreproteomeController < ApplicationController
  
  def analyze
    @species = Genome.get_genome_species()
    if params[:species_id]
      # return vars
      @cores = Array.new
      @pans = Array.new
      @genomes = Array.new
      @sims = Array.new
      
      # get all distinct refseq_ids
      refseqs = ActiveRecord::Base.connection.select_rows("select distinct straight_join bioproject_id, name, sequence_id from lineages left join uniprot_entries on lineages.taxon_id = uniprot_entries.taxon_id  left join refseq_cross_references on uniprot_entry_id = uniprot_entries.id  left join genomes on sequence_id = genomes.refseq_id  where species = #{params[:species_id]} and refseq_id IS NOT NULL")
      
      # vars used in the loop
      pan = Set.new
      core = nil
      sequences = Hash.new
      
      # group them by bioproject_id and calculate the pan and core numbers
      refseqs.group_by{|r| r[0]}.each do |k,v|
        @genomes << v[0][1]
        result = Set.new
        v.each do |r|
          result |= ActiveRecord::Base.connection.select_values("SELECT original_sequence_id FROM peptides LEFT JOIN  refseq_cross_references ON peptides.uniprot_entry_id = refseq_cross_references.uniprot_entry_id WHERE refseq_cross_references.sequence_id = '#{r[2]}'").to_set
        end
        sequences[v[0][1]] = result
        pan |= result
        if core.nil?
          core = result
        else
          core &= result
        end
        @cores << core.size
        @pans << pan.size
      end
      
      @genomes.each_index do |i|
        @sims[i] = Array.new
      end
      @genomes.each_index do |i1|
        @genomes.each_index do |i2|
          if @sims[i1][i2].nil?
            sim = (sequences[@genomes[i1]] & sequences[@genomes[i2]]).length / (sequences[@genomes[i1]] | sequences[@genomes[i2]]).length.to_f
            @sims[i1][i2] = sim
            @sims[i2][i1] = sim
          end
        end
      end
      
    else
      @genomes = ["Bacillus cereus ATCC 14579","Bacillus cereus ATCC 10987","Bacillus cereus E33L","Bacillus cereus NC7401","Bacillus cereus F837/76","Bacillus cereus Q1","Bacillus cereus G9842","Bacillus cereus B4264","Bacillus cereus AH187","Bacillus cereus AH820","Bacillus cereus 03BB102","Bacillus cereus biovar anthracis str. CI"]
      @cores = [92529, 45041, 39468, 37670, 36692, 34186, 33276, 32676, 31996, 31424, 31367, 30952]
      @pans = [92529, 138046, 168711, 187823, 204437, 226265, 240912, 247543, 258817, 266792, 267728, 273056]
    end
    
  end

end