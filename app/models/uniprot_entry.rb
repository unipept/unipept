# == Schema Information
#
# Table name: uniprot_entries
#
#  id                       :integer          unsigned, not null, primary key
#  uniprot_accession_number :string(10)       not null
#  version                  :integer          unsigned, not null
#  taxon_id                 :integer          unsigned, not null
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
  has_many :interpro_cross_references
  has_many :proteome_cross_references

  has_many :peptides
  has_many :ec_numbers, through: :ec_cross_references
  has_many :go_terms, through: :go_cross_references
  has_many :interpro_entries, through: :interpro_cross_references

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

  # Summarises the functional annotations of a list of entries
  # Note: this should only be used for peptides who's FA's have
  # not been precalculated (because they were mot in the DB)
  #
  # @param entries list of UniprotEnteries that match the sequence
  def self.summarize_fa(entries)
    data = Hash.new(0)

    uniprot_entry_ids = entries.map(&:id)

    # Count GO term occurences
    ups_with_go = Set.new
    uniprot_entry_ids
      .each_slice(50) do |id_batch|
        GoCrossReference
          .where(uniprot_entry_id: id_batch)
          .all
          .each do |cr|
            ups_with_go.add(cr.uniprot_entry_id)
            # Also count in how many proteins this GO term occurs
            data[cr.go_term_code] += 1
          end
      end

    # Count EC Term occurences
    ups_with_ec = Set.new
    uniprot_entry_ids
      .each_slice(50) do |id_batch|
      EcCrossReference
        .where(uniprot_entry_id: id_batch)
        .all
        .each do |cr|
        ups_with_ec.add(cr.uniprot_entry_id)
        # Also count in how many proteins this EC number occurs
        data['EC:' + cr.ec_number_code] += 1
      end
    end

    # Count InterPro code occurences
    ups_with_ipr = Set.new
    uniprot_entry_ids
      .each_slice(50) do |id_batch|
      InterproCrossReference
        .where(uniprot_entry_id: id_batch)
        .all
        .each do |cr|
        ups_with_ipr.add(cr.uniprot_entry_id)
        data['IPR:' + cr.interpro_entry_code] += 1
      end
    end

    {
      'num' => {
        'all' => entries.length,
        'EC' => ups_with_ec.length,
        'GO' => ups_with_go.length,
        'IPR' => ups_with_ipr.length
      },
      'data' => data
    }
  end
end
