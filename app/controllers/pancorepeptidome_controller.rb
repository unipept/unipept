class PancorepeptidomeController < ApplicationController

  def analyze
    @title = "Unique Peptide Finder"

    start = Time.now
    @species = Genome.get_genome_species().map{|g| [g["name"], g["id"]]}
    logger.debug (Time.now  - start).to_s
    @genomes = Genome.joins(:lineage).select("genomes.name, genomes.bioproject_id, lineages.species as species_id, lineages.genus as genus_id, lineages.order as order_id, lineages.class as class_id").where("status = 'Complete'").uniq

    @taxa = Set.new
    @taxa.merge(@genomes.map{|g| g.species_id})
    @taxa.merge(@genomes.map{|g| g.genus_id})
    @taxa.merge(@genomes.map{|g| g.order_id})
    @taxa.merge(@genomes.map{|g| g.class_id})
    @taxa = Hash[Taxon.select([:id, :name]).where(:id => @taxa.to_a).map{|t| [t.id, t.name]}]

    @taxa = Oj.dump(@taxa, mode: :compat)
    @genomes = Oj.dump(@genomes, mode: :compat)
  end

  # Returns a list of all sequence_ids for a given bioproject_id
  def get_sequence_ids_for_bioproject
    cache = GenomeCache.get_by_bioproject_id(params[:bioproject_id])
    respond_to do |format|
      format.json { render json: cache.json_sequences }
    end
  end

  # Returns a list of genomes for a given species_id or genus_id
  def get_genomes
    genomes = Genome.get_by_species_id(params[:species_id])
    respond_to do |format|
      format.json { render json: Oj.dump(genomes, mode: :compat) }
    end
  end

  # Returns a filtered list of unique sequence id's for a given LCA
  def get_unique_sequences
    sequences = JSON(params[:sequences])
    lca = Lineage.calculate_lca(Lineage.find_by_sql("SELECT lineages.* from genomes LEFT JOIN lineages ON genomes.taxon_id = lineages.taxon_id WHERE bioproject_id IN (#{params[:bioprojects]})"))
    result = params[:type] == "genome" ? Sequence.filter_unique_genome_peptides(sequences, lca) : Sequence.filter_unique_uniprot_peptides(sequences, lca)
    lca = Taxon.find_by_id(lca).name
    render json: Oj.dump([lca, result], mode: :compat)
  end

  # returns a list of sequences
  def get_sequences
    ids = JSON(params[:sequence_ids])
    render json: Oj.dump(Sequence.list_sequences(ids).join("\n"), mode: :compat)
  end
end