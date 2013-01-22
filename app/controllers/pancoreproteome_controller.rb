class PancoreproteomeController < ApplicationController
  
  def analyze
    @genomes = ["NC_003909.8", "NC_004722.1", "NC_006274.1", "NC_011658.1", "NC_011725.1", "NC_011772.1", "NC_011773.1", "NC_011969.1", "NC_012472.1", "NC_014335.1", "NC_016771.1", "NC_016779.1"]
    @cores = Array.new
    @pans = Array.new
    pan = Set.new
    core = nil
    @genomes.each do|g|
      result = ActiveRecord::Base.connection.select_all("SELECT DISTINCT original_sequence_id FROM peptides LEFT JOIN  uniprot_cross_references ON peptides.uniprot_entry_id = uniprot_cross_references.uniprot_entry_id WHERE uniprot_cross_references.sequence_id = '#{g}'").to_set
      pan |= result
      if core.nil?
        core = result
      else
        core &= result
      end
      @cores << core.size
      @pans << pan.size
    end
    
  end

end