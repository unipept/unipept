# == Schema Information
#
# Table name: dataset_items
#
#  id         :integer(4)      not null, primary key
#  dataset_id :integer(4)
#  name       :string(160)
#  data       :text(16777215)  default(""), not null
#  order      :integer(4)
#

class DatasetItem < ActiveRecord::Base
  belongs_to :dataset
end
