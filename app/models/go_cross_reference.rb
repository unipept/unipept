# == Schema Information
#
# Table name: go_cross_references
#
#  id               :integer          unsigned, not null, primary key
#  uniprot_entry_id :integer          unsigned, not null
#  go_term_code     :string(15)       not null
#

class GoCrossReference < ApplicationRecord
  include ReadOnlyModel

  belongs_to :uniprot_entry
  belongs_to :go_term, foreign_key: 'go_term_code', primary_key: 'code', class_name: 'GoTerm'
end
