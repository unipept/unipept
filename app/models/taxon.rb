# == Schema Information
#
# Table name: taxons
#
#  id          :integer          not null, primary key
#  name        :string(120)      not null
#  rank        :string(16)
#  parent_id   :integer
#  valid_taxon :boolean          default(TRUE), not null
#

class Taxon < ActiveRecord::Base
  include ReadOnlyModel
  attr_accessible nil

  belongs_to :lineage, :foreign_key  => "id", :primary_key  => "taxon_id", :class_name   => 'Lineage'

  scope :with_genome, -> { uniq.joins("RIGHT JOIN uniprot_entries ON taxons.id = uniprot_entries.taxon_id") }

  #sorting order
  def <=>(o)
    return -1 if o.nil?
    return self.id <=> o.id
  end

end
