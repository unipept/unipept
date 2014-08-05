# == Schema Information
#
# Table name: counters
#
#  name  :string(31)       not null, primary key
#  value :integer          default(0), not null
#

class Counter < ActiveRecord::Base

self.primary_key = :name

end
