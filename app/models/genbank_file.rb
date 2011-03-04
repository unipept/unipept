# == Schema Information
#
# Table name: genbank_files
#
#  id               :integer(4)      not null, primary key
#  project_id       :string(32)      not null
#  accession_number :string(32)      not null
#  draft            :(1)             default("b'0'"), not null
#  taxon_id         :integer(4)      not null
#  hash             :string(32)      not null
#

class GenbankFile < ActiveRecord::Base
  attr_accessible nil
  
  has_many :peptides 
  belongs_to :name,             :foreign_key  => "taxon_id", 
                                :primary_key  => "id", 
                                :class_name   => 'Taxon'
  
  validates :project_id,  :presence   => true
  validates :accession_number,  :presence   => true
  validates :draft,  :presence   => true
  validates :taxon_id,  :presence   => true
  validates :hash,  :presence   => true
  
end
