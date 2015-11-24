# == Schema Information
#
# Table name: proteomes
#
#  id                        :integer          not null, primary key
#  proteome_accession_number :string(12)       not null
#  organism_name             :string(86)       not null
#  taxon_id                  :integer
#  type_strain               :binary(1)        default("b'0'"), not null
#  reference_proteome        :binary(1)        default("b'0'"), not null
#  strain                    :string(45)
#  assembly                  :string(45)
#

class Proteome < ActiveRecord::Base
  attr_readonly :id, :proteome_accession_number, :organism_name, :taxon_id, :type_strain, :reference_proteome, :strain, :assembly

  belongs_to :lineage, foreign_key: 'taxon_id', primary_key: 'taxon_id',  class_name: 'Lineage'
  has_many :proteome_cross_references

  def destroy
    fail ActiveRecord::ReadOnlyRecord
  end

  def delete
    fail ActiveRecord::ReadOnlyRecord
  end

  def type_strain
    self[:type_strain] == "\x01" ? true : false
  end

  def reference_proteome
    self[:reference_proteome] == "\x01" ? true : false
  end

  # fills in the taxon_id column
  def self.precompute_taxa
    taxa = connection.select_all("SELECT DISTINCT proteome_id, uniprot_entries.taxon_id
      FROM uniprot_entries
      INNER JOIN proteome_cross_references
        ON uniprot_entry_id = uniprot_entries.id;")
    taxa = Hash[taxa.map { |t| [t['proteome_id'], t['taxon_id']] }]
    Proteome.all.find_each do |proteome|
      proteome.taxon_id = taxa[proteome.id]
      proteome.save
    end
  end

  # fills the assembly_cache table
  def self.precompute_assembly_caches
    Proteome.where('taxon_id is not null').find_each do |proteome|
      ProteomeCache.get_by_proteome_id(proteome.id)
    end
  end
end
