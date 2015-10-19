# == Schema Information
#
# Table name: ec_numbers
#
#  ec_number 		:string(12)       not null, primary key
#  name	            :string(160)      not null
#

class EcNumber < ActiveRecord::Base
  include ReadOnlyModel
  attr_accessible nil

  has_many :ec_cross_reference
end
