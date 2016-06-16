# == Schema Information
#
# Table name: interpro_cross_references
#
#  id                  :integer          not null, primary key
#  uniprot_entry_id    :integer          not null
#  interpro_entry_code :string(15)       not null
#

class InterproCrossReference < ActiveRecord::Base
  include ReadOnlyModel
  attr_accessible nil

  belongs_to :uniprot_entry
  belongs_to :interpro_entry
end
