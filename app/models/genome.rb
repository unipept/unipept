# == Schema Information
#
# Table name: genomes
#
#  id            :integer(4)      not null, primary key
#  bioproject_id :integer(4)      not null
#  refseq_id     :string(15)      not null
#  status        :string(45)      not null
#

class Genome < ActiveRecord::Base
  attr_accessible nil
  
end
