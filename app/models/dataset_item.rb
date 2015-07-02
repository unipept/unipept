# == Schema Information
#
# Table name: dataset_items
#
#  id         :integer          not null, primary key
#  dataset_id :integer
#  name       :string(160)
#  data       :text(16777215)   not null
#  order      :integer
#

class DatasetItem < ActiveRecord::Base
  attr_accessible :name, :data

  belongs_to :dataset

  validates :name, presence: true,
                   length: { maximum: 160 }
  validates :data, presence: true,
                   length: { maximum: 16_777_215 }
end
