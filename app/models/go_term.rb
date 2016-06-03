class Goterm < ActiveRecord::Base
  include ReadOnlyModel
  attr_accessible nil

  has_many :go_cross_references, foreign_key: 'go_term_id', primary_key: 'id', class_name: 'go_cross_reference'
  has_many :go_lcas
end
