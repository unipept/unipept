# == Schema Information
#
# Table name: embl_cross_references
#
#  id               :integer          not null, primary key
#  uniprot_entry_id :integer          not null
#  protein_id       :string(25)
#  sequence_id      :string(25)
#

class EmblCrossReference < ApplicationRecord
  include ReadOnlyModel
  attr_accessible nil

  belongs_to :uniprot_entry

  # Returns a set of sequence_ids for a given refseq_id
  def self.get_sequence_ids(insdc_id)
    connection.select_values("SELECT original_sequence_id
      FROM peptides
      LEFT JOIN  embl_cross_references ON peptides.uniprot_entry_id = embl_cross_references.uniprot_entry_id
      WHERE embl_cross_references.sequence_id = '#{insdc_id}'").to_set
  end
end
