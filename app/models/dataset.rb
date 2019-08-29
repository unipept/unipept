# == Schema Information
#
# Table name: datasets
#
#  id              :integer          unsigned, not null, primary key
#  environment     :string(160)
#  reference       :string(500)
#  url             :string(200)
#  project_website :string(200)
#

class Dataset < ApplicationRecord
  has_many :dataset_items, dependent: :destroy
  accepts_nested_attributes_for :dataset_items, allow_destroy: true

  validates :environment,     presence: true,
                              length: { maximum: 160 }
  validates :reference,       presence: true,
                              length: { maximum: 500 }
  validates :url,             presence: true,
                              length: { maximum: 200 }
  validates :project_website, presence: true,
                              length: { maximum: 200 }
end
