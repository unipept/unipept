# == Schema Information
#
# Table name: lineages
#
#  taxon_id         :integer          not null, primary key
#  superkingdom     :integer
#  kingdom          :integer
#  subkingdom       :integer
#  superphylum      :integer
#  phylum           :integer
#  subphylum        :integer
#  superclass       :integer
#  class            :integer
#  subclass         :integer
#  infraclass       :integer
#  superorder       :integer
#  order            :integer
#  suborder         :integer
#  infraorder       :integer
#  parvorder        :integer
#  superfamily      :integer
#  family           :integer
#  subfamily        :integer
#  tribe            :integer
#  subtribe         :integer
#  genus            :integer
#  subgenus         :integer
#  species_group    :integer
#  species_subgroup :integer
#  species          :integer
#  subspecies       :integer
#  varietas         :integer
#  forma            :integer
#

require 'spec_helper'

describe Lineage do
  pending "add some examples to (or delete) #{__FILE__}"
end
