# == Schema Information
#
# Table name: ec_numbers
#
#  id   :integer          not null, primary key
#  code :string(15)       not null
#  name :string(140)      not null
#

class EcNumber < ActiveRecord::Base
  include ReadOnlyModel

end
