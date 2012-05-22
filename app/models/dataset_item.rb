# == Schema Information
#
# Table name: dataset_items
#
#  id         :integer(4)      not null, primary key
#  dataset_id :integer(4)
#  name       :string(160)
#  path       :string(160)
#  order      :integer(4)
#

class DatasetItem < ActiveRecord::Base
  belongs_to :dataset
  
end
