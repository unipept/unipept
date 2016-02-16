class InterproEntry < ActiveRecord::Base
  include ReadOnlyModel
  attr_accessible nil

  has_many :interpro_cross_references, foreign_key: 'interpro_entry_id', primary_key: 'id', class_name: 'interpro_cross_reference'
end
