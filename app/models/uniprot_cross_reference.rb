# == Schema Information
#
# Table name: uniprot_cross_references
#
#  id               :integer(4)      not null, primary key
#  uniprot_entry_id :integer(4)      not null
#  type             :string(6)       not null
#  protein_id       :string(15)
#  sequence_id      :string(15)
#

class UniprotCrossReference < ActiveRecord::Base
  attr_accessible nil
  
  belongs_to :uniprot_entry
  
end
