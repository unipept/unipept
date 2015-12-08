# == Schema Information
#
# Table name: sequences
#
#  id       :integer          not null, primary key
#  sequence :string(50)       not null
#  lca      :integer
#  lca_il   :integer
#

class Sequence < ActiveRecord::Base
  include ReadOnlyModel
  attr_accessible nil

  has_many :peptides
  has_many :original_peptides, foreign_key: 'original_sequence_id', primary_key: 'id', class_name: 'Peptide'

  belongs_to :lca_t, foreign_key: 'lca', primary_key: 'id', class_name: 'Taxon'
  belongs_to :lca_il_t, foreign_key: 'lca_il', primary_key: 'id', class_name: 'Taxon'

  alias_method :generated_peptides, :peptides
  def peptides(equate_il = true)
    if equate_il
      generated_peptides
    else
      original_peptides
    end
  end

  def lineages(equate_il = true, eager = false)
    fail(ArgumentError, ':equate_il must be a boolean') unless Sequence.boolean?(equate_il)
    fail(ArgumentError, ':eager must be a boolean') unless Sequence.boolean?(eager)

    l = Lineage.select('lineages.*, count(*) as hits').joins(uniprot_entries: :peptides).group('lineages.taxon_id')
    if equate_il
      l = l.where('peptides.sequence_id = ?', id)
    else
      l = l.where('peptides.original_sequence_id = ?', id)
    end
    l = l.includes(:name, Lineage::ORDER_T) if eager
    l
  end

  # Calculates the lowest common ancestor for this sequence
  def calculate_lca(equate_il = true, return_taxon = false)
    if equate_il
      return lca_il_t if return_taxon
      return lca_il
    else
      return lca_t if return_taxon
      return lca
    end
  end

  def self.peptides_relation_name(equate_il)
    fail(ArgumentError, ':equate_il must be a boolean') unless boolean?(equate_il)
    equate_il ? :peptides : :original_peptides
  end

  def self.lca_t_relation_name(equate_il)
    fail(ArgumentError, ':equate_il must be a boolean') unless boolean?(equate_il)
    equate_il ? :lca_il_t : :lca_t
  end

  # search for a single sequence, include information through join tables
  def self.single_search(sequence, equate_il = true)
    fail(ArgumentError, ':equate_il must be a boolean') unless boolean?(equate_il)
    fail SequenceTooShortError if sequence.length < 5
    sequence = sequence.tr('I', 'L') if equate_il
    # this solves the N+1 query problem
    includes(peptides_relation_name(equate_il) => { uniprot_entry: [:taxon, :ec_cross_references, :go_cross_references] })
      .find_by_sequence(sequence)
  end

  # try to find multiple matches for a single sequence
  def self.advanced_single_search(sequence, equate_il = true)
    fail(ArgumentError, ':equate_il must be a boolean') unless boolean?(equate_il)
    # sanity check
    fail(NoMatchesFoundError, sequence) if sequence.index(/([KR])([^P])/).nil?

    sequence = sequence.tr('I', 'L') if equate_il

    # Split in silico (use little trick to fix overlap)
    sequences = sequence.gsub(/([KR])([^P])/, "\\1\n\\2").gsub(/([KR])([^P])/, "\\1\n\\2").lines.map(&:strip).to_a

    # build query
    query = includes(peptides_relation_name(equate_il) => { uniprot_entry: [:taxon, :lineage] })
    long_sequences = sequences.select { |s| s.length >= 5 }.map { |s| query.find_by_sequence(s) }

    # check if it has a match for every sequence and at least one long part
    fail NoMatchesFoundError, sequence if long_sequences.include? nil
    fail SequenceTooShortError if long_sequences.size == 0

    long_sequences
  end

  # Returns an array of sequences strings based on a list of sequence id's
  def self.list_sequences(ids)
    Sequence.where(id: ids).pluck(:sequence)
  end

  # Filters a list of sequences for having a given lca
  # WARNING, sequences is not escaped in the query, so it should only contains
  # integers
  def self.filter_unique_uniprot_peptides(sequences, lca)
    connection.select_values("select id from sequences where lca = #{lca} AND id in (#{sequences.join(',')}) order by id")
  end

  def self.boolean?(variable)
    variable.is_a?(TrueClass) || variable.is_a?(FalseClass)
  end
end

# some errors
class SequenceTooShortError < StandardError; end
class NoMatchesFoundError < StandardError; end
