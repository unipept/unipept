# == Schema Information
#
# Table name: sequences
#
#  id       :integer          not null, primary key
#  sequence :string(50)       not null
#  lca      :integer
#  lca_il   :integer
#  fa       :blob
#  fa_il    :blob
#

require 'ostruct'

class Sequence < ApplicationRecord
  include ReadOnlyModel

  has_many :peptides
  has_many :original_peptides, foreign_key: 'original_sequence_id', primary_key: 'id', class_name: 'Peptide'

  belongs_to :lca_t, foreign_key: 'lca', primary_key: 'id', class_name: 'Taxon'
  belongs_to :lca_il_t, foreign_key: 'lca_il', primary_key: 'id', class_name: 'Taxon'

  alias generated_peptides peptides
  def peptides(equate_il = true)
    if equate_il
      generated_peptides
    else
      original_peptides
    end
  end

  def lineages(equate_il = true, eager = false)
    raise(ArgumentError, ':equate_il must be a boolean') unless Sequence.boolean?(equate_il)
    raise(ArgumentError, ':eager must be a boolean') unless Sequence.boolean?(eager)

    l = Lineage.select('lineages.*, count(*) as hits').joins(uniprot_entries: :peptides).group('lineages.taxon_id')
    l = if equate_il
          l.where('peptides.sequence_id = ?', id)
        else
          l.where('peptides.original_sequence_id = ?', id)
        end
    l = l.includes(:name, Lineage::ORDER_T) if eager
    l
  end

  # Calculates the lowest common ancestor for this sequence
  def calculate_lca(equate_il = true, return_taxon = false)
    if equate_il
      return lca_il_t if return_taxon
      lca_il
    else
      return lca_t if return_taxon
      lca
    end
  end

  def fa_il
    unmarshall_fa(:fa_il)
  end

  def fa
    unmarshall_fa(:fa)
  end

  # Calculates thefor this sequence
  def calculate_fa(equate_il = true)
    equate_il ? fa_il : fa
  end

  def self.missed_cleavage(sequence, equate_il)
    sequences = sequence
                .gsub(/([KR])([^P])/, "\\1\n\\2")
                .gsub(/([KR])([^P])/, "\\1\n\\2")
                .lines.map(&:strip).to_a

    # search the most unique sequence
    p_counts = Sequence.where(sequence: sequences)
                       .joins(equate_il ? :peptides : :original_peptides)
                       .group('sequences.id')
                       .select('sequences.id, count(*) as num_of_peptides')

    return nil if p_counts.empty?

    entries = Sequence
              .includes(Sequence.peptides_relation_name(equate_il) => { uniprot_entry: :lineage })
              .find(p_counts.min_by(&:num_of_peptides).id)
              .peptides(equate_il).map(&:uniprot_entry).to_set
              .select { |e| e.protein_contains?(sequence, equate_il) }

    return nil if entries.empty?

    lineages = entries.map(&:lineage).uniq.compact
    lca = Lineage.calculate_lca_taxon(lineages)

    fadata = UniprotEntry.summarize_fa(entries)

    if equate_il
      Sequence.new(
        sequence: sequence,
        lca_il: lca.id,
        lca_il_t: lca,
        fa: false,
        fa_il: fadata
      )
    else
      Sequence.new(
        sequence: sequence,
        lca: lca.id,
        lca_t: lca,
        fa: fadata,
        fa_il: false
      )
    end
  end

  def self.peptides_relation_name(equate_il)
    raise(ArgumentError, ':equate_il must be a boolean') unless boolean?(equate_il)
    equate_il ? :peptides : :original_peptides
  end

  def self.lca_t_relation_name(equate_il)
    raise(ArgumentError, ':equate_il must be a boolean') unless boolean?(equate_il)
    equate_il ? :lca_il_t : :lca_t
  end

  # search for a single sequence, include information through join tables
  def self.single_search(sequence, equate_il = true)
    raise(ArgumentError, ':equate_il must be a boolean') unless boolean?(equate_il)
    raise SequenceTooShortError if sequence.length < 5
    sequence = sequence.tr('I', 'L') if equate_il
    # this solves the N+1 query problem
    includes(peptides_relation_name(equate_il) => { uniprot_entry: %i[taxon ec_numbers go_terms] })
      .find_by(sequence: sequence)
  end

  # try to find multiple matches for a single sequence
  def self.advanced_single_search(sequence, equate_il = true)
    raise(ArgumentError, ':equate_il must be a boolean') unless boolean?(equate_il)
    # sanity check
    raise(NoMatchesFoundError, sequence) if sequence.index(/([KR])([^P])/).nil?

    sequence = sequence.tr('I', 'L') if equate_il

    # Split in silico (use little trick to fix overlap)
    sequences = sequence.gsub(/([KR])([^P])/, "\\1\n\\2").gsub(/([KR])([^P])/, "\\1\n\\2").lines.map(&:strip).to_a

    # build query
    query = includes(peptides_relation_name(equate_il) => { uniprot_entry: %i[taxon lineage] })
    long_sequences = sequences.select { |s| s.length >= 5 }.map { |s| query.find_by(sequence: s) }

    # check if it has a match for every sequence and at least one long part
    raise NoMatchesFoundError, sequence if long_sequences.include? nil
    raise SequenceTooShortError if long_sequences.empty?

    long_sequences
  end

  # Returns an array of sequences strings based on a list of sequence id's
  # This function used to contain an ActiveRecord query, but the huge number of
  # integers in the where field resulted in a huge query contruction time.
  # Constructing the query manually is many times faster.
  def self.list_sequences(ids)
    return [] if ids.empty?
    connection.select_values("select sequence from sequences where id in (#{ids.join(',')})")
  end

  # Filters a list of sequences for having a given lca
  # WARNING, sequences is not escaped in the query, so it should only contains
  # integers.
  # This function used to contain an ActiveRecord query, but the huge number of
  # integers in the where field resulted in a huge query contruction time.
  # Constructing the query manually is many times faster.
  # For a bacterial genome, 50ms was spent on the query, 600ms on the
  # construction. See issue #543 for more information.
  def self.filter_unique_uniprot_peptides(sequences, lca)
    connection.select_values("select id from sequences where lca = #{lca} AND id in (#{sequences.join(',')}) order by id")
  end

  def self.boolean?(variable)
    variable.is_a?(TrueClass) || variable.is_a?(FalseClass)
  end

  private

  # Parse the JSON in :fa of :fa_il
  def unmarshall_fa(prop)
    if self[prop].blank?
      return nil if self[prop] == false
      self[prop] = { 'num' => { 'all' => 0, 'EC' => 0, 'GO' => 0 }, 'data' => {} }
    end
    return self[prop] if self[prop].is_a?(Hash)
    self[prop] = Oj.load(self[prop])
  end
end

# some errors
class SequenceTooShortError < StandardError; end
class NoMatchesFoundError < StandardError; end
