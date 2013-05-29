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
    @species = Genome.get_genome_species().map{|g| [g["name"], g["id"]]}
  end

  # Returns a list of all sequence_ids for a given bioproject_id
  def sequence_ids
    cache = GenomeCache.find_by_bioproject_id(params[:bioproject_id])
    if cache.nil?
      result_set = Set.new
      Genome.find_all_by_bioproject_id(params[:bioproject_id]).each do |genome|
        result_set.merge(RefseqCrossReference.get_sequence_ids(genome.refseq_id))
      end
      json = Oj.dump(result_set.to_a.sort!, mode: :compat)
      cache = GenomeCache.create(bioproject_id: params[:bioproject_id], json_sequences: json)
    end
    respond_to do |format|
      format.json { render json: cache.json_sequences }
    end
  end

  # Returns a list of genomes for a given species_id
  def genomes
    genomes = Genome.get_by_species_id(params[:species_id])
    respond_to do |format|
      format.json { render json: Oj.dump(genomes, mode: :compat) }
    end
  end
end