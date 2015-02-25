# == Schema Information
#
# Table name: refseq_cross_references
#
#  id               :integer          not null, primary key
#  uniprot_entry_id :integer          not null
#  protein_id       :string(15)
#  sequence_id      :string(15)
#

class RefseqCrossReference < ActiveRecord::Base
  include ReadOnlyModel
  attr_accessible nil

  belongs_to :uniprot_entry
end
