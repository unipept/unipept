# == Schema Information
#
# Table name: embl_cross_references
#
#  id               :integer          not null, primary key
#  uniprot_entry_id :integer          not null
#  protein_id       :string(15)
#  sequence_id      :string(15)
#

class EmblCrossReference < ActiveRecord::Base
  attr_accessible nil

  belongs_to :uniprot_entry

  # Returns a set af sequence_ids for a given refseq_id
  def self.get_sequence_ids(insdc_id)
    return connection.select_values("SELECT original_sequence_id 
      FROM peptides 
      LEFT JOIN  embl_cross_references ON peptides.uniprot_entry_id = embl_cross_references.uniprot_entry_id 
      WHERE embl_cross_references.sequence_id = '#{insdc_id}'").to_set
  end
end
