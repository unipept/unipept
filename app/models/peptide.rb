# == Schema Information
#
# Table name: peptides
#
#  id          :integer(4)      not null, primary key
#  sequence_id :integer(4)      not null
#  organism_id :integer(4)      not null
#  position    :integer(4)      not null
#

class Peptide < ActiveRecord::Base
  attr_accessible nil
  
  belongs_to :organism
  belongs_to :sequence
end
