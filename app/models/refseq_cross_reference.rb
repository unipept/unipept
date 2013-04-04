# == Schema Information
#
# Table name: refseq_cross_references
#
#  id               :integer(4)      not null, primary key
#  uniprot_entry_id :integer(4)      not null
#  protein_id       :string(15)
#  sequence_id      :string(15)
#

class RefseqCrossReference < ActiveRecord::Base
  attr_accessible nil

  belongs_to :uniprot_entry

  # Returns a set af sequence_ids for a given refseq_cross_reference sequence_id
  def self.get_species_ids(s_id)
    return connection.select_values("SELECT original_sequence_id FROM peptides LEFT JOIN  refseq_cross_references ON peptides.uniprot_entry_id = refseq_cross_references.uniprot_entry_id WHERE refseq_cross_references.sequence_id = '#{s_id}'").to_set
  end
end
