# == Schema Information
#
# Table name: sequences
#
#  id       :integer(4)      not null, primary key
#  sequence :string(50)      not null
#  lca      :integer(3)
#  lca_il   :integer(3)
#

class Sequence < ActiveRecord::Base

  has_many :peptides
  has_many :original_peptides, :foreign_key  => "original_sequence_id", :primary_key  => "id", :class_name   => 'Peptide'

  belongs_to :lca_t, :foreign_key  => "lca", :primary_key  => "id",  :class_name   => 'Taxon'
  belongs_to :lca_il_t, :foreign_key  => "lca_il", :primary_key  => "id",  :class_name   => 'Taxon'

  def self.relation_name(equate_il)
    equate_il ? :peptides : :original_peptides
  end

  # search for a single sequence, include information through join tables
  def self.single_search(sequence, equate_il = true)
    raise SequenceTooShortError if sequence.length < 5
    sequence.gsub!(/I/,'L') if equate_il
    # this solves the N+1 query problem
    self.includes(peptides: {uniprot_entry: :name}).
      find_by_sequence(sequence)
  end


  # try to find multiple matches
  def self.multi_search(sequence, equate_il = true)
    # sanity check
    raise NoMatchesFoundError.new(sequence) if sequence.index(/([KR])([^P])/).nil?

    # Split in silico (use little trick to fix overlap)
    sequences = sequence.gsub(/([KR])([^P])/,"\\1\n\\2").gsub(/([KR])([^P])/,"\\1\n\\2").lines.map(&:strip).to_a


    # build query
    query = self.includes(relation_name(equate_il) => {:uniprot_entry => [:name, :lineage]})
    long_sequences = sequences.select{|s| s.length >= 5}.map{|s| query.find_by_sequence(s) }

    # check if it has a match for every sequence and at least one long part
    raise NoMatchesFoundError.new(sequence) if long_sequences.include? nil
    raise SequenceTooShortError if long_sequences.size == 0

    long_sequences
  end

  # SELECT DISTINCT lineages.* FROM unipept.peptides INNER JOIN unipept.uniprot_entries ON (uniprot_entries.id = peptides.uniprot_entry_id) INNER JOIN unipept.lineages ON (uniprot_entries.taxon_id = lineages.taxon_id) WHERE peptides.sequence_id = #{id}
  def lineages(equate_il = true, eager = false)
    if equate_il
      if eager
        l = Lineage.joins(:uniprot_entries => :peptides).where("peptides.sequence_id = ?", id).uniq.includes(:name,
                  :superkingdom_t, :kingdom_t, :subkingdom_t, :superphylum_t, :phylum_t,
                  :subphylum_t, :superclass_t, :class_t, :subclass_t, :infraclass_t,
                  :superorder_t, :order_t, :suborder_t, :infraorder_t, :parvorder_t, :superfamily_t,
                  :family_t, :subfamily_t, :tribe_t, :subtribe_t, :genus_t, :subgenus_t,
                  :species_group_t, :species_subgroup_t, :species_t, :subspecies_t,
                  :varietas_t, :forma_t)
      else
        l = Lineage.joins(:uniprot_entries => :peptides).where("peptides.sequence_id = ?", id).uniq
      end
    else
      if eager
        l = Lineage.joins(:uniprot_entries => :peptides).where("peptides.original_sequence_id = ?", id).uniq.includes(:name, :superkingdom_t, :kingdom_t, :subkingdom_t, :superphylum_t, :phylum_t, :subphylum_t, :superclass_t, :class_t, :subclass_t, :infraclass_t, :superorder_t, :order_t, :suborder_t, :infraorder_t, :parvorder_t, :superfamily_t, :family_t, :subfamily_t, :tribe_t, :subtribe_t, :genus_t, :subgenus_t, :species_group_t, :species_subgroup_t, :species_t, :subspecies_t, :varietas_t, :forma_t)
      else
        l = Lineage.joins(:uniprot_entries => :peptides).where("peptides.original_sequence_id = ?", id).uniq
      end
    end
    return l
  end

  # Calculates the lowest common ancestor for this sequence
  def calculate_lca(equate_il = true, return_taxon = false)
    if equate_il
      if lca_il.nil?
        temp = Lineage.calculate_lca(lineages(true))
        write_attribute(:lca_il, temp) unless temp==-1
        save
      end
      return lca_il_t if return_taxon
      return lca_il
    else
      if lca.nil?
        temp = Lineage.calculate_lca(lineages(false))
        write_attribute(:lca, temp) unless temp==-1
        save
      end
      return lca_t if return_taxon
      return lca
    end
  end

  # Calculates the LCAs for all sequences
  def self.calculate_lcas(equate_il = true)
    slice_size = 1000
    id = Counter.find_by_name("lca_counter")
    id = Counter.new({:name => "lca_counter", :value => 0}, :without_protection => true) if id.nil?
    max = Sequence.find(:first, :order => 'id DESC').id
    while id.value < max
      if id.value % 100000 == 0
        File.open("public/progress", 'w') { |file| file.write("LCA calculator#" + ActionController::Base.helpers.number_with_precision((id.value * 100.0 / max), :precision => 2) ) }
      end
      ActiveRecord::Base.transaction do
        sequences = Sequence.find(:all, :conditions => ['id BETWEEN ? AND ?', id.value, id.value + slice_size])
        sequences.each{|s| s.calculate_lca(equate_il)}
      end
      id.value += slice_size;
      id.save;
    end
  end

  # Processes the input file and writes the results in csv format to the output file
  def self.batch_process(input, output = "output.csv", equate_il = true, filter_duplicates = true, handle_missed = false)
    file = File.open(input, 'r')
    slice_size = 1000
    data = file.readlines.each_slice(slice_size).to_a
    num_of_slices = data.size
    current_slice = 0

    File.open(output, 'w') { |file| file.write(CSV.generate_line ["peptide"].concat(Lineage.ranks)) }

    for slice in data do
      csv_string = ""
      File.open("public/progress", 'w') { |file| file.write("batch process#" + ActionController::Base.helpers.number_with_precision((current_slice * 100.0 / num_of_slices), :precision => 2) ) }

      query = slice.join("\n")
      data = query.upcase
      data = data.gsub(/I/,'L') if equate_il
      data = data.gsub(/([KR])([^P])/,"\\1\n\\2").gsub(/([KR])([^P])/,"\\1\n\\2") unless handle_missed
      data = data.lines.map(&:strip).to_a.select{|l| l.size >= 5}
      data_counts = Hash[data.group_by{|k| k}.map{|k,v| [k, v.length]}]
      data = data_counts.keys

      # build the resultset
      matches = Hash.new
      misses = data.to_set
      if equate_il
        sequences = Sequence.includes({:lca_il_t => {:lineage => [:superkingdom_t, :kingdom_t, :subkingdom_t, :superphylum_t, :phylum_t, :subphylum_t, :superclass_t, :class_t, :subclass_t, :infraclass_t, :superorder_t, :order_t, :suborder_t, :infraorder_t, :parvorder_t, :superfamily_t, :family_t, :subfamily_t, :tribe_t, :subtribe_t, :genus_t, :subgenus_t, :species_group_t, :species_subgroup_t, :species_t, :subspecies_t, :varietas_t, :forma_t]}}).where(sequence: data)
      else
        sequences = Sequence.includes({:lca_t => {:lineage => [:superkingdom_t, :kingdom_t, :subkingdom_t, :superphylum_t, :phylum_t, :subphylum_t, :superclass_t, :class_t, :subclass_t, :infraclass_t, :superorder_t, :order_t, :suborder_t, :infraorder_t, :parvorder_t, :superfamily_t, :family_t, :subfamily_t, :tribe_t, :subtribe_t, :genus_t, :subgenus_t, :species_group_t, :species_subgroup_t, :species_t, :subspecies_t, :varietas_t, :forma_t]}}).where(sequence: data)
      end
      sequences.each do |sequence| # for every sequence in query
        lca_t = sequence.calculate_lca(equate_il, true)
        unless lca_t.nil?
          num_of_seq = filter_duplicates ? 1 : data_counts[sequence.sequence]
          matches[lca_t] = Array.new if matches[lca_t].nil?
          num_of_seq.times do
            matches[lca_t] << sequence.sequence
          end
        end
        misses.delete(sequence.sequence)
      end

      # handle the misses
      if handle_missed
        iter = misses.to_a
        for seq in iter
          sequences = seq.gsub(/([KR])([^P])/,"\\1\n\\2").gsub(/([KR])([^P])/,"\\1\n\\2").lines.map(&:strip).to_a
          next if sequences.size == 1
          sequences = sequences.select{|s| s.length >= 5}
          if sequences.select{|s| s.length >= 8}.length >=1
            sequences = sequences.select{|s| s.length >= 8}
          elsif sequences.select{|s| s.length >= 7}.length >=1
            sequences = sequences.select{|s| s.length >= 7}
          elsif sequences.select{|s| s.length >= 6}.length >=1
            sequences = sequences.select{|s| s.length >= 6}
          end

          if equate_il
            long_sequences = sequences.map{|s| Sequence.find_by_sequence(s, :include => {:peptides => {:uniprot_entry => :lineage}})}
          else
            long_sequences = sequences.map{|s| Sequence.find_by_sequence(s, :include => {:original_peptides => {:uniprot_entry => :lineage}})}
          end

          # jump the loop
          next if long_sequences.include? nil
          next if long_sequences.size == 0

          # calculate possible uniprot entries
          if equate_il
            temp_entries = long_sequences.map{|s| s.peptides.map(&:uniprot_entry).to_set}
          else
            temp_entries = long_sequences.map{|s| s.original_peptides.map(&:uniprot_entry).to_set}
          end

          # take the intersection of all sets
          entries = temp_entries[0]
          for i in 1..(temp_entries.size-1) do
            entries = entries & temp_entries[i]
          end

          # check if the protein contains the startsequence
          if equate_il
            entries.select!{|e| e.protein.gsub(/I/,'L').include? seq}
          else
            entries.select!{|e| e.protein.include? seq}
          end

          # skip if nothing left
          next if entries.size == 0

          seq_lins = entries.map(&:lineage).uniq.compact
          lca_t = Lineage.calculate_lca_taxon(seq_lins) #calculate the LCA

          unless lca_t.nil?
            num_of_seq = filter_duplicates ? 1 : data_counts[seq]
            matches[lca_t] = Array.new if matches[lca_t].nil?
            num_of_seq.times do
              matches[lca_t] << seq
            end
          end
          misses.delete(seq)
        end
      end

      matches.each do |taxon, sequences| # for every match
        lca_l = taxon.lineage
        for sequence in sequences do
          csv_string += CSV.generate_line [sequence].concat(lca_l.to_a)
        end
      end
      File.open(output, 'a') { |file| file.write(csv_string) }
      current_slice += 1
    end
    File.open("public/progress", 'w') { |file| file.write("batch process#100") }
  end

  # Returns an array of sequences strings based on a list of sequence id's
  def self.list_sequences(ids)
    Sequence.where(id: ids).pluck(:sequence)
  end

  # Filters a list of sequences for a given lca
  def self.filter_unique_uniprot_peptides(sequences, lca)
    Sequence.where(id: sequences, lca: lca).order(:id).pluck(:id)
  end

  # Filters a list of sequences for a given lca
  def self.filter_unique_genome_peptides(sequences, species_id)
    # alternative query
    # was slower in tests
    #a = connection.select_values("SELECT original_sequence_id FROM peptides
    #left join refseq_cross_references on peptides.uniprot_entry_id = refseq_cross_references.uniprot_entry_id
    #WHERE original_sequence_id IN (#{sequences.join(",")})
    #AND refseq_cross_references.sequence_id IN
    #(SELECT refseq_id FROM genomes WHERE species_id != #{species_id})").to_a

    bp_id = Set.new
    result = sequences
    GenomeCache.find_by_sql("SELECT genome_caches.* from genome_caches LEFT JOIN genomes ON genome_caches.bioproject_id = genomes.bioproject_id LEFT JOIN lineages ON genomes.taxon_id = lineages.taxon_id WHERE lineages.species != #{species_id}").each do |genome|
      if bp_id.include?(genome.bioproject_id)
        next
      else
        bp_id.add(genome.bioproject_id)
      end
      genome = Oj.load(genome.json_sequences)
      r = []
      i = 0
      j = 0
      while i < result.length && j < genome.length do
        if result[i] > genome[j]
          j += 1
        elsif result[i] < genome[j]
          r << result[i]
          i += 1
        else
          i += 1
          j += 1
        end
      end
      while i < result.length do
        r << result[i]
        i += 1
      end
      result = r
    end
    return result
  end
end
