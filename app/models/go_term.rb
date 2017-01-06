# == Schema Information
#
# Table name: go_terms
#
#  id        :integer          not null, primary key
#  code      :string(15)       not null
#  namespace :string(18)       not null
#  name      :string(200)      not null
#

class GoTerm < ApplicationRecord
  include ReadOnlyModel
end
