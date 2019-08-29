# == Schema Information
#
# Table name: refseq_cross_references
#
#  id               :integer          unsigned, not null, primary key
#  uniprot_entry_id :integer          unsigned, not null
#  protein_id       :string(25)
#  sequence_id      :string(25)
#

class RefseqCrossReference < ApplicationRecord
  include ReadOnlyModel

  belongs_to :uniprot_entry
end
