class PeptidomeController < ApplicationController
  def analyze
    @header_class = 'peptidome'
    @tab = params[:tab]
    if @tab == 'peptidefinder'
      @title = 'Unique Peptide Finder'
    elsif @tab == 'peptidomeclustering'
      @title = 'Peptidome Clustering'
    else
      @title = 'Peptidome Analysis'
      @tab = 'peptidefinder'
    end

    @genomes = Proteome.joins(:lineage).select('proteomes.proteome_name as name, proteomes.id, proteomes.proteome_accession_number as proteome_accession, proteomes.type_strain, proteomes.reference_proteome, lineages.species as species_id, lineages.genus as genus_id, lineages.order as order_id, lineages.class as class_id').uniq

    @taxa = Set.new
    @taxa.merge(@genomes.map(&:species_id))
    @taxa.merge(@genomes.map(&:genus_id))
    @taxa.merge(@genomes.map(&:order_id))
    @taxa.merge(@genomes.map(&:class_id))
    @taxa = Hash[Taxon.select([:id, :name, :rank])
                 .where(id: @taxa.to_a)
                 .map { |t| [t.id, Hash['name' => t.name, 'rank' => t.rank]] }]

    @taxa = Oj.dump(@taxa, mode: :compat)
    @genomes = Oj.dump(@genomes, mode: :compat)
  end

  # Returns a list of all sequence_ids for a given proteome_id
  def get_sequence_ids_for_proteome
    cache = ProteomeCache.get_by_proteome_id(params[:proteome_id])
    respond_to do |format|
      format.json { render json: cache.json_sequences }
    end
  end

  # Returns a filtered list of unique sequence id's for a given LCA
  def get_unique_sequences
    sequences = JSON(params[:sequences])
    if params[:ids].size > 0
      lca = Lineage.calculate_lca(Lineage.find_by_sql("SELECT lineages.* from proteomes LEFT JOIN lineages ON proteomes.taxon_id = lineages.taxon_id WHERE proteomes.id IN (#{params[:ids]}) AND proteomes.taxon_id is not null"))
      result = Sequence.filter_unique_uniprot_peptides(sequences, lca)
      lca = Taxon.find_by_id(lca).name
    else
      lca = 'undefined'
      result = []
    end
    render json: Oj.dump([lca, result], mode: :compat)
  end

  # Returns a list of sequences
  def get_sequences
    ids = JSON(params[:sequence_ids])
    render json: Oj.dump(Sequence.list_sequences(ids).join("\n"), mode: :compat)
  end

  # Converts a list of peptides to id's
  def convert_peptides
    peptides = JSON(params[:peptides])
    ids = Sequence.where(sequence: peptides).pluck(:id)
    render json: Oj.dump(ids, mode: :compat)
  end

  # Calculates the LCA of a list of bioproject id's
  def get_lca
    params[:ids] = [] if params[:ids].nil?
    if params[:ids].size > 0
      lca = Lineage.calculate_lca(Lineage.find_by_sql("SELECT lineages.* from proteomes LEFT JOIN lineages ON proteomes.taxon_id = lineages.taxon_id WHERE proteomes.id IN (#{params[:ids]}) AND proteomes.taxon_id is not null"))
      lca = Taxon.find_by_id(lca)
    else
      lca = { name: 'undefined' }
    end
    render json: Oj.dump(lca, mode: :compat)
  end
end
