class Goterm < ActiveRecord::Base
  include ReadOnlyModel
  attr_accessible nil

  has_many :go_cross_references
end
