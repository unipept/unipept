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
  attr_accessible :environment, :reference, :url, :project_website, :dataset_items_attributes
  has_many :dataset_items, :dependent => :destroy
  accepts_nested_attributes_for :dataset_items, :allow_destroy => true
end
