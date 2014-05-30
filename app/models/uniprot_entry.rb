# == Schema Information
#
# Table name: uniprot_entries
#
#  id                       :integer(4)      not null, primary key
#  uniprot_accession_number :string(8)       not null
#  version                  :integer(2)      not null
#  taxon_id                 :integer(3)      not null
#  type                     :string(9)       not null
#  protein                  :text            default(""), not null
#

class UniprotEntry < ActiveRecord::Base
  attr_accessible nil

  has_many :peptides
  has_many :refseq_cross_references
  has_many :ec_cross_references
  has_many :go_cross_references

  belongs_to :name,             :foreign_key  => "taxon_id",
                                :primary_key  => "id",
                                :class_name   => 'Taxon'

  belongs_to :lineage,          :foreign_key  => "taxon_id",
                                :primary_key  => "taxon_id",
                                :class_name   => 'Lineage'

  validates :uniprot_accession_number,  :presence   => true
  validates :version,  :presence   => true
  validates :taxon_id,  :presence   => true
  validates :type,  :presence   => true

  self.inheritance_column = "type_id"

  def protein_contains?(sequence, equate_il)
    if equate_il
      protein.gsub(/I/,'L').include? sequence.gsub(/I/,'L')
    else
      protein.include? sequence
    end
  end

end
