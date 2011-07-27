# == Schema Information
#
# Table name: counters
#
#  name  :string(31)      not null
#  value :integer(4)      default(0), not null
#

class Counter < ActiveRecord::Base
  attr_accessible nil
  
end
