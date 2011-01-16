# == Schema Information
#
# Table name: organisms
#
#  id         :integer(4)      not null, primary key
#  name       :string(512)     not null
#  taxon_id   :integer(4)      not null
#  species_id :integer(4)      not null
#  genus_id   :integer(4)      not null
#

class Organism < ActiveRecord::Base
end
