# == Schema Information
#
# Table name: uniprot_entries
#
#  id                       :integer          not null, primary key
#  uniprot_accession_number :string(10)       not null
#  version                  :integer          not null
#  taxon_id                 :integer          not null
#  type                     :string(9)        not null
#  name                     :string(150)      not null
#  protein                  :text(65535)      not null
#

class UniprotEntry < ApplicationRecord
  include ReadOnlyModel

  has_many :refseq_cross_references
  has_many :embl_cross_references
  has_many :ec_cross_references
  has_many :go_cross_references
  has_many :proteome_cross_references

  has_many :peptides
  has_many :ec_numbers, through: :ec_cross_references
  has_many :go_terms, through: :go_cross_references

  belongs_to :taxon,            foreign_key: 'taxon_id',
                                primary_key: 'id',
                                class_name: 'Taxon'

  belongs_to :lineage,          foreign_key: 'taxon_id',
                                primary_key: 'taxon_id',
                                class_name: 'Lineage'

  # the type attribute is used by rails to specify inheritance so we change
  # the default value
  self.inheritance_column = 'type_id'

  def protein_contains?(sequence, equate_il)
    if equate_il
      protein.tr('I', 'L').include? sequence.tr('I', 'L')
    else
      protein.include? sequence
    end
  end

  # Summarises the fucntional annotations of a list of enteries
  # Note: this should only be used for peptides who's FA's have
  # not been precalculated (because they were mot in the DB)
  #
  # @param entries list of UniprotEnteries that match the sequence
  def self.summarize_fa(entries)
    # Count GO term occurences
    data = entries
           .flat_map(&:go_terms)
           .each_with_object(Hash.new(0)) { |term, acc| acc[term.code] += 1; }

    # Count EC numbers occurences
    data = entries
           .flat_map(&:ec_numbers)
           .each_with_object(data) { |num, acc| acc['EC:' + num.code] += 1; }

    {
      'num' => {
        'all' => entries.length,
        'EC' => entries.count { |e| !e.ec_numbers.empty? },
        'GO' => entries.count { |e| !e.go_terms.empty? }
      },
      'data' => data
    }
  end
end
