# == Schema Information
#
# Table name: ec_cross_references
#
#  id               :integer(4)      not null, primary key
#  uniprot_entry_id :integer(4)      not null
#  ec_id            :string(15)      not null
#

class EcCrossReference < ActiveRecord::Base
  attr_accessible nil
  
  belongs_to :uniprot_entry
end
