# == Schema Information
#
# Table name: uniprot_entries
#
#  id                       :integer          not null, primary key
#  uniprot_accession_number :string(10)       not null
#  version                  :integer          not null
#  taxon_id                 :integer          not null
#  type                     :string(9)        not null
#  name                     :string(150)      not null
#  protein                  :text             not null
#

class UniprotEntry < ActiveRecord::Base
  include ReadOnlyModel
  attr_accessible nil

  has_many :peptides
  has_many :refseq_cross_references
  has_many :embl_cross_references
  has_many :ec_cross_references
  has_many :go_cross_references

  belongs_to :taxon,            :foreign_key  => "taxon_id",
                                :primary_key  => "id",
                                :class_name   => 'Taxon'

  belongs_to :lineage,          :foreign_key  => "taxon_id",
                                :primary_key  => "taxon_id",
                                :class_name   => 'Lineage'

  # the type attribute is used by rails to specify inheritance so we change
  # the default value
  self.inheritance_column = "type_id"

  def protein_contains?(sequence, equate_il)
    if equate_il
      protein.gsub(/I/,'L').include? sequence.gsub(/I/,'L')
    else
      protein.include? sequence
    end
  end

end
