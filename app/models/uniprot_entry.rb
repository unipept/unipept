# == Schema Information
#
# Table name: uniprot_entries
#
#  id                       :integer(4)      not null, primary key
#  uniprot_accession_number :string(8)       not null
#  version                  :integer(2)      not null
#  taxon_id                 :integer(3)      not null
#  type                     :string(0)       not null
#

class UniprotEntry < ActiveRecord::Base
  attr_accessible nil
  
  has_many :peptides 
  belongs_to :name,             :foreign_key  => "taxon_id", 
                                :primary_key  => "id", 
                                :class_name   => 'Taxon'
  
  validates :uniprot_accession_number,  :presence   => true
  validates :version,  :presence   => true
  validates :taxon_id,  :presence   => true
  validates :type,  :presence   => true
  
end
