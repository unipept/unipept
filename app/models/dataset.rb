# == Schema Information
#
# Table name: datasets
#
#  id              :integer(4)      not null, primary key
#  environment     :string(160)
#  reference       :string(500)
#  project_website :string(200)
#  data            :text            default(""), not null
#

class Dataset < ActiveRecord::Base
  has_many :dataset_items, :dependent => :destroy
  accepts_nested_attributes_for :dataset_items, :allow_destroy => true
end
