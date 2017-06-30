# == Schema Information
#
# Table name: refseq_cross_references
#
#  id               :integer          not null, primary key
#  uniprot_entry_id :integer          not null
#  protein_id       :string(25)
#  sequence_id      :string(25)
#

class RefseqCrossReference < ApplicationRecord
  include ReadOnlyModel

  belongs_to :uniprot_entry
end
