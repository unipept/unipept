# == Schema Information
#
# Table name: genome_caches
#
#  bioproject_id  :integer(4)      not null, primary key
#  json_sequences :text(16777215)  default(""), not null
#

class GenomeCache < ActiveRecord::Base
  attr_accessible :bioproject_id, :json_sequences
end
