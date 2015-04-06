# == Schema Information
#
# Table name: assemblies
#
#  id                         :integer          not null, primary key
#  genbank_assembly_accession :string(16)
#  refseq_assembly_accession  :string(16)
#  taxon_id                   :integer
#  genome_representation      :string(7)        not null
#  assembly_level             :string(20)       not null
#  assembly_name              :string(104)      not null
#  organism_name              :string(86)       not null
#  biosample                  :string(14)
#

class Assembly < ActiveRecord::Base
  attr_readonly :id, :genbank_assembly_accession, :refseq_assembly_accession, :genome_representation, :assembly_level, :assembly_name, :organism_name

  belongs_to :lineage, :foreign_key  => "taxon_id", :primary_key  => "taxon_id",  :class_name   => 'Lineage'
  has_many :assembly_sequences

  def destroy
    raise ActiveRecord::ReadOnlyRecord
  end

  def delete
    raise ActiveRecord::ReadOnlyRecord
  end

  def self.get_assembly_species()
    # order by uses filesort since there's no index on taxon name
    # maybe add status filter?
    return connection.select_all("SELECT taxons.name, taxons.id, count(*) AS num
     FROM assemblies
     INNER JOIN lineages ON (assemblies.taxon_id = lineages.taxon_id)
     LEFT JOIN taxons ON (lineages.species = taxons.id)
     WHERE taxons.id IS NOT NULL
     /*AND status = 'Complete'*/
     GROUP BY taxons.id
     HAVING num >= 1
     ORDER BY name")
  end

  # returns a set of genome objects for a given species_id
  def self.get_by_species_id(species_id)
    # maybe add status filter?
    #Assembly.select("id, organism_name").joins(:lineage).where("genomes.status = 'Complete' AND lineages.species = ?", species_id).group("bioproject_id")
    Assembly.select("id, organism_name as name").joins(:lineage).where("lineages.species = ?", species_id)
  end

  # fills in the taxon_id column
  def self.precompute_taxa
    taxa = connection.select_all("SELECT DISTINCT assembly_id, uniprot_entries.taxon_id
      FROM uniprot_entries
      INNER JOIN embl_cross_references
        ON uniprot_entry_id = uniprot_entries.id
      INNER JOIN assembly_sequences
        ON sequence_id = assembly_sequences.genbank_accession;")
    taxa = Hash[ taxa.map{ |t| [t["assembly_id"], t["taxon_id"]] } ]
    Assembly.all.each do |assembly|
      assembly.taxon_id = taxa[assembly.id]
      assembly.save
    end
  end

  # fills the assembly_cache table
  def self.precompute_assembly_caches
    Assembly.where("taxon_id is not null").each do |assembly|
      AssemblyCache.get_by_assembly_id(assembly.id)
    end
  end
end
