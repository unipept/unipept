# == Schema Information
#
# Table name: ec_cross_references
#
#  id               :integer          not null, primary key
#  uniprot_entry_id :integer          not null
#  ec_number        :string(12)       not null
#

class EcCrossReference < ActiveRecord::Base
  include ReadOnlyModel
  attr_accessible nil

  belongs_to :uniprot_entry
  belongs_to :ec_number_info, foreign_key: 'ec_number', primary_key: 'ec_number', class_name: 'ec_number'


  # adds some sort of LCA calculation for EC numbers.
  # the input is an array of ec numbers represented as strings.
  def self.calculate_lca(ecs)
    return "nil" if ecs.empty?
    lca = ""
    done = false
    splits = ecs.map{|e| e.split(".")}
    for level in (0..3).to_a do
      if done
        lca += "-."
      else
        current = splits.map{|r| r[level] == "-" ? nil : r[level]}.uniq.compact
        if current.length == 1
          lca += current[0] + "."
        else
          lca += "-."
          done = true
        end
      end
    end
    return lca.chop
  end
end
