# == Schema Information
#
# Table name: assembly_sequences
#
#  id                :integer          not null, primary key
#  assembly_id       :integer          not null
#  sequence_type     :string(13)       default("na"), not null
#  genbank_accession :string(25)       not null
#

class AssemblySequence < ActiveRecord::Base
  include ReadOnlyModel
  attr_accessible nil

  belongs_to :assembly
end
