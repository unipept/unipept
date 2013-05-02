# == Schema Information
#
# Table name: go_cross_references
#
#  id               :integer(4)      not null, primary key
#  uniprot_entry_id :integer(4)      not null
#  go_id            :string(15)      not null
#

class GoCrossReference < ActiveRecord::Base
  attr_accessible nil
  
  belongs_to :uniprot_entry
end
