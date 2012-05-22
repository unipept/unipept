# == Schema Information
#
# Table name: datasets
#
#  id              :integer(4)      not null, primary key
#  environment     :string(160)
#  reference       :string(500)
#  url             :string(200)
#  project_website :string(200)
#

class Dataset < ActiveRecord::Base
  has_many :dataset_items
  
end
