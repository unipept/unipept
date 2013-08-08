# == Schema Information
#
# Table name: ec_numbers
#
#  id     :integer          not null, primary key
#  number :string(12)       not null
#  name   :string(160)      not null
#

class EcNumber < ActiveRecord::Base
  
end
