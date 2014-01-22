# == Schema Information
#
# Table name: peptides
#
#  id                   :integer(4)      not null, primary key
#  sequence_id          :integer(4)      not null
#  original_sequence_id :integer(4)      not null
#  uniprot_entry_id     :integer(4)      not null
#  position             :integer(2)      not null
#

class Peptide < ActiveRecord::Base
  attr_accessible nil

  belongs_to :uniprot_entry
  belongs_to :sequence
  belongs_to :original_sequence, :foreign_key  => "original_sequence_id", :primary_key  => "id", :class_name   => 'Sequence'

  validates :sequence_id,  :presence   => true
  validates :uniprot_entry_id,  :presence   => true
end
