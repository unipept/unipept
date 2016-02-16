class EcNumber < ActiveRecord::Base
  include ReadOnlyModel
  attr_accessible nil

  has_many :ec_cross_references, foreign_key: 'ec_number_id', primary_key: 'id', class_name: 'ec_cross_reference'
end
