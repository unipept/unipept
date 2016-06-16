# == Schema Information
#
# Table name: go_lcas
#
#  id          :integer          not null, primary key
#  sequence_id :integer          not null
#  go_lca      :integer
#  go_lca_il   :integer
#

class GoLca < ActiveRecord::Base
	include ReadOnlyModel
	attr_accessible nil

	belongs_to :sequence
	belongs_to :go_lca_g, foreign_key: 'go_lca', primary_key: 'id', class_name: 'Go_term'
	belongs_to :go_lca_il_g, foreign_key: 'go_lca_il', primary_key: 'id', class_name: 'Go_term'
end