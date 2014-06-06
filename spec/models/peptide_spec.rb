# == Schema Information
#
# Table name: peptides
#
#  id                   :integer          not null, primary key
#  sequence_id          :integer          not null
#  original_sequence_id :integer          not null
#  uniprot_entry_id     :integer          not null
#  position             :integer          not null
#

require 'spec_helper'

describe Peptide do
  pending "add some examples to (or delete) #{__FILE__}"
end
