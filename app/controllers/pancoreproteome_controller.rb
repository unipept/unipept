class PancoreproteomeController < ApplicationController

  # This method isn't used anymore
  def old_analyze
    @species = Genome.get_genome_species()
    if params[:species_id]
      # return vars
      @cores = Array.new
      @pans = Array.new
      @genomes = Array.new
      @sims = Array.new
      
      # get all distinct refseq_ids
      refseqs = Genome.get_by_species_id(1396).map{|g| [g.bioproject_id, g.name, g.refseq_id]}  
      
      # vars used in the loop
      pan = Set.new
      core = nil
      sequences = Hash.new
      
      # group them by bioproject_id and calculate the pan and core numbers
      refseqs.group_by{|r| r[0]}.each do |k,v|
        @genomes << v[0][1]
        result = Set.new
        v.each do |r|
          result |= RefseqCrossReference.get_sequence_ids(r[2])
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
      
      @sims2 = Array.new
      @sims.each {|e| @sims2 << Array.new(e)}
      active = Array.new
      @genomes.length.times do |i|
        active << i
      end
      
      joins = Array.new
      (@genomes.length-1).times do
        best = -1
        best_i = 0
        best_m = 0
        active.each do |i|
          active.each do |m|
            if i != m && @sims2[i][m] > best
              best = @sims2[i][m]
              best_i = i
              best_m = m
            end
          end
        end
        joins << [best_i, best_m]
        active.each do |j|
          avg = (@sims2[best_i][j] + @sims2[best_m][j])/2.0
          @sims2[best_i][j] = avg
          @sims2[j][best_i] = avg
        end
        active.delete best_m
      end
      order = joins.pop
      joins.reverse.each do |p|
        i = order.index p[0]
        order.insert(i, p[1])
      end
      @order = order
    end
  end

  def analyze
    start = Time.now
    @species = Genome.get_genome_species().map{|g| [g["name"], g["id"]]} 
    logger.debug (Time.now  - start).to_s
    @genomes = Genome.joins(:lineage).select("genomes.name, genomes.bioproject_id, lineages.species as species_id, lineages.genus as genus_id, lineages.order as order_id, lineages.class as class_id").uniq

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
    render json: Oj.dump(result, mode: :compat)
  end
end