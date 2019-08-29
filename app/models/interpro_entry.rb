# == Schema Information
#
# Table name: interpro_entries
#
#  id       :integer          unsigned, not null, primary key
#  code     :string(9)        not null
#  category :string(32)       not null
#  name     :string(160)      not null
#

class InterproEntry < ApplicationRecord
  include ReadOnlyModel
end
