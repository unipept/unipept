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

  # SELECT DISTINCT lineages.* FROM unipept.peptides INNER JOIN unipept.uniprot_entries ON (uniprot_entries.id = peptides.uniprot_entry_id) INNER JOIN unipept.lineages ON (uniprot_entries.taxon_id = lineages.taxon_id) WHERE peptides.sequence_id = #{id}
  def lineages(equate_il = true, eager = false)
    if equate_il
      if eager
        l = Lineage.select("lineages.*").joins(:uniprot_entries => :peptides).where("peptides.sequence_id = ?", id).uniq.includes(:name,
                  :superkingdom_t, :kingdom_t, :subkingdom_t, :superphylum_t, :phylum_t,
                  :subphylum_t, :superclass_t, :class_t, :subclass_t, :infraclass_t,
                  :superorder_t, :order_t, :suborder_t, :infraorder_t, :parvorder_t, :superfamily_t,
                  :family_t, :subfamily_t, :tribe_t, :subtribe_t, :genus_t, :subgenus_t,
                  :species_group_t, :species_subgroup_t, :species_t, :subspecies_t,
                  :varietas_t, :forma_t)
      else
        l = Lineage.select("lineages.*").joins(:uniprot_entries => :peptides).where("peptides.sequence_id = ?", id).uniq
      end
    else
      if eager
        l = Lineage.select("lineages.*").joins(:uniprot_entries => :peptides).where("peptides.original_sequence_id = ?", id).uniq.includes(:name, :superkingdom_t, :kingdom_t, :subkingdom_t, :superphylum_t, :phylum_t, :subphylum_t, :superclass_t, :class_t, :subclass_t, :infraclass_t, :superorder_t, :order_t, :suborder_t, :infraorder_t, :parvorder_t, :superfamily_t, :family_t, :subfamily_t, :tribe_t, :subtribe_t, :genus_t, :subgenus_t, :species_group_t, :species_subgroup_t, :species_t, :subspecies_t, :varietas_t, :forma_t)
      else
        l = Lineage.select("lineages.*").joins(:uniprot_entries => :peptides).where("peptides.original_sequence_id = ?", id).uniq
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
  def self.batch_process(input, output = "output.csv")
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
      data = query.upcase.gsub(/([KR])([^P])/,"\\1\n\\2").gsub(/([KR])([^P])/,"\\1\n\\2").lines.map(&:strip).to_a
      data_counts = Hash[data.group_by{|k| k}.map{|k,v| [k, v.length]}]
      data = data_counts.keys

      # build the resultset
      matches = Hash.new
      sequences = Sequence.find_all_by_sequence(data, :include => {:lca_t => {:lineage => [:superkingdom_t, :kingdom_t, :subkingdom_t, :superphylum_t, :phylum_t, :subphylum_t, :superclass_t, :class_t, :subclass_t, :infraclass_t, :superorder_t, :order_t, :suborder_t, :infraorder_t, :parvorder_t, :superfamily_t, :family_t, :subfamily_t, :tribe_t, :subtribe_t, :genus_t, :subgenus_t, :species_group_t, :species_subgroup_t, :species_t, :subspecies_t, :varietas_t, :forma_t]}})
      sequences.each do |sequence| # for every sequence in query
        lca_t = sequence.calculate_lca(false, true)
        unless lca_t.nil?
          matches[lca_t] = Array.new if matches[lca_t].nil?
          matches[lca_t] << sequence.sequence
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

  # Filters a list of sequences for a given lca
  def self.filter_unique_uniprot_peptides(sequences, lca)
    connection.select_values(Sequence.select(:id).where(:id => sequences, :lca => lca).to_sql).to_a.sort!
  end

  # Filters a list of sequences for a given lca
  def self.filter_unique_genome_peptides(sequences, species_id)
    a = connection.select_values("SELECT peptides.original_sequence_id FROM genomes 
    LEFT JOIN refseq_cross_references ON genomes.refseq_id = refseq_cross_references.sequence_id
    LEFT JOIN peptides ON refseq_cross_references.uniprot_entry_id = peptides.uniprot_entry_id
    WHERE peptides.original_sequence_id IN (#{sequences.join(",")})
    AND species_id != #{species_id}").to_a
    return sequences - a
  end
end
