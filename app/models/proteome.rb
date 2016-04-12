# == Schema Information
#
# Table name: proteomes
#
#  id                        :integer          not null, primary key
#  proteome_accession_number :string(12)       not null
#  proteome_name             :string(86)       not null
#  taxon_id                  :integer
#  type_strain               :binary(1)        default("b'0'"), not null
#  reference_proteome        :binary(1)        default("b'0'"), not null
#  strain                    :string(45)
#  assembly                  :string(45)
#  name                      :string(128)
#

class Proteome < ActiveRecord::Base
  attr_readonly :id, :proteome_accession_number, :proteome_name, :type_strain, :reference_proteome, :strain, :assembly

  belongs_to :lineage, foreign_key: 'taxon_id', primary_key: 'taxon_id', class_name: 'Lineage'
  has_many :proteome_cross_references

  def destroy
    fail ActiveRecord::ReadOnlyRecord
  end

  def delete
    fail ActiveRecord::ReadOnlyRecord
  end

  def full_name
    return proteome_name if strain.nil?
    return proteome_name if proteome_name.count(' ') > 1
    return proteome_name if proteome_name.include?('(')
    return proteome_name unless proteome_name.index(/[0-9]/).nil?
    proteome_name + ' ' + strain
  end

  def type_strain
    self[:type_strain] == "\x01" ? true : false
  end

  def reference_proteome
    self[:reference_proteome] == "\x01" ? true : false
  end

  # returns a cached json object containing all proteomes
  def self.json_proteomes
    versions = Rails.application.config.versions
    cache_key = "proteomes_#{versions[:unipept]}_#{versions[:uniprot]}"
    Rails.cache.fetch(cache_key, expires_in: 1.year) do
      Oj.dump(Proteome.proteomes, mode: :compat)
    end
  end

  # returns a cached json object containing all taxon data needed for the
  # proteomes
  def self.json_taxa
    versions = Rails.application.config.versions
    cache_key = "taxa_#{versions[:unipept]}_#{versions[:uniprot]}"
    Rails.cache.fetch(cache_key, expires_in: 1.year) do
      Proteome.precompute_taxa
      Oj.dump(Proteome.taxa, mode: :compat)
    end
  end

  # returns all proteomes in the database
  def self.proteomes
    Proteome.joins(:lineage).select('proteomes.name as name, proteomes.id, proteomes.proteome_accession_number as proteome_accession, proteomes.type_strain, proteomes.reference_proteome, lineages.species as species_id, lineages.genus as genus_id, lineages.order as order_id, lineages.class as class_id').uniq
  end

  # returns all taxa needed for the proteomes
  def self.taxa
    proteomes = Proteome.proteomes

    taxa = Set.new
    taxa.merge(proteomes.map(&:species_id))
    taxa.merge(proteomes.map(&:genus_id))
    taxa.merge(proteomes.map(&:order_id))
    taxa.merge(proteomes.map(&:class_id))
    Hash[Taxon.select([:id, :name, :rank])
      .where(id: taxa.to_a)
      .map { |t| [t.id, Hash['name' => t.name, 'rank' => t.rank]] }]
  end

  # fills in the taxon_id column
  def self.precompute_taxa
    Proteome.all.find_each do |proteome|
      taxon_id = connection.select_value("SELECT uniprot_entries.taxon_id, count(*) AS num
        FROM uniprot_entries
        INNER JOIN proteome_cross_references
          ON uniprot_entry_id = uniprot_entries.id
        WHERE proteome_id = #{proteome.id}
        GROUP BY taxon_id
        ORDER BY num DESC
        LIMIT 1")
      proteome.taxon_id = taxon_id
      proteome.name = proteome.full_name
      proteome.save
    end
  end

  # fills the proteome_caches table
  def self.precompute_proteome_caches
    Proteome.where('taxon_id is not null').find_each do |proteome|
      ProteomeCache.get_encoded_sequences(proteome.id)
    end
  end
end
