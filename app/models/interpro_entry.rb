class InterproEntry < ActiveRecord::Base
  include ReadOnlyModel
  attr_accessible nil

  has_many :interpro_cross_references
end
