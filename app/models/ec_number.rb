# == Schema Information
#
# Table name: ec_numbers
#
#  id   :integer          unsigned, not null, primary key
#  code :string(15)       not null
#  name :string(155)      not null
#

class EcNumber < ApplicationRecord
  include ReadOnlyModel
end
