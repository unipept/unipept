# == Schema Information
#
# Table name: lineages
#
#  taxon_id         :integer(4)      not null
#  superkingdom     :integer(4)
#  kingdom          :integer(4)
#  superphylum      :integer(4)
#  phylum           :integer(4)
#  subphylum        :integer(4)
#  superclass       :integer(4)
#  class            :integer(4)
#  subclass         :integer(4)
#  infraclass       :integer(4)
#  superorder       :integer(4)
#  order            :integer(4)
#  suborder         :integer(4)
#  infraorder       :integer(4)
#  parvorder        :integer(4)
#  superfamily      :integer(4)
#  family           :integer(4)
#  subfamily        :integer(4)
#  tribe            :integer(4)
#  subtribe         :integer(4)
#  genus            :integer(4)
#  subgenus         :integer(4)
#  species_group    :integer(4)
#  species_subgroup :integer(4)
#  species          :integer(4)
#  subspecies       :integer(4)
#  varietas         :integer(4)
#  forma            :integer(4)
#

class Lineage < ActiveRecord::Base
  attr_accessible nil
  
end
