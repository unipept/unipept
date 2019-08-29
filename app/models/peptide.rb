# == Schema Information
#
# Table name: peptides
#
#  id                   :integer          unsigned, not null, primary key
#  sequence_id          :integer          unsigned, not null
#  original_sequence_id :integer          unsigned, not null
#  uniprot_entry_id     :integer          unsigned, not null
#

class Peptide < ApplicationRecord
  include ReadOnlyModel

  belongs_to :uniprot_entry
  belongs_to :sequence
  belongs_to :original_sequence, foreign_key: 'original_sequence_id', primary_key: 'id', class_name: 'Sequence'

  # since this is a read-only model, these validations aren't used
  validates :sequence_id, presence: true
  validates :original_sequence_id, presence: true
  validates :uniprot_entry_id, presence: true
end
