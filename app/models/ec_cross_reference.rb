# == Schema Information
#
# Table name: ec_cross_references
#
#  id               :integer          not null, primary key
#  uniprot_entry_id :integer          not null
#  ec_id            :string(12)       not null
#

class EcCrossReference < ActiveRecord::Base
  include ReadOnlyModel
  attr_accessible nil

  belongs_to :uniprot_entry

  # adds some sort of LCA calculation for EC numbers.
  # the input is an array of ec numbers represented as strings.
  def self.calculate_lca(ecs)
    lca = ""
    splits = ecs.map{|e| e.split(".")}
    for level in (0..3).to_a do
      current = splits.map{|r| r[level]}.uniq
      return lca.chop if current.length > 1 #more than one distinct element
      lca += current[0] + "."
    end
    return lca.chop
  end
end
