# == Schema Information
#
# Table name: interpro_entries
#
#  id               :integer          not null, primary key
#  interpro_code    :string(9)        not null
#  type             :string(32)       not null
#  name             :string(160)      not null
#

class InterproEntry < ApplicationRecord
  include ReadOnlyModel
end
