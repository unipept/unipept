class Go_lca < ActiveRecord::Base
	include ReadOnlyModel
	attr_accessible nil

	belongs_to :go_term
	belongs_to :sequence
end
