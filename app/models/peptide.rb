# == Schema Information
#
# Table name: peptides
#
#  id              :integer(4)      not null, primary key
#  sequence_id     :integer(4)      not null
#  genbank_file_id :integer(4)      not null
#

class Peptide < ActiveRecord::Base
  attr_accessible nil
  
  belongs_to :genbank_file
  belongs_to :sequence
  
  validates :sequence_id,  :presence   => true
  validates :genbank_file_id,  :presence   => true
end
