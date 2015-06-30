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
  has_many :original_peptides, :foreign_key  => "original_sequence_id", :primary_key  => "id", :class_name   => 'Peptide'

  belongs_to :lca_t, :foreign_key  => "lca", :primary_key  => "id",  :class_name   => 'Taxon'
  belongs_to :lca_il_t, :foreign_key  => "lca_il", :primary_key  => "id",  :class_name   => 'Taxon'


  alias_method :generated_peptides, :peptides
  def peptides(equate_il = true)
    if equate_il
      self.generated_peptides
    else
      self.original_peptides
    end
  end

  # SELECT DISTINCT lineages.* FROM unipept.peptides INNER JOIN unipept.uniprot_entries ON (uniprot_entries.id = peptides.uniprot_entry_id) INNER JOIN unipept.lineages ON (uniprot_entries.taxon_id = lineages.taxon_id) WHERE peptides.sequence_id = #{id}
  def lineages(equate_il = true, eager = false)
    raise(ArgumentError, ":equate_il must be a boolean") unless Sequence.is_boolean?(equate_il)
    raise(ArgumentError, ":eager must be a boolean") unless Sequence.is_boolean?(eager)

    l = Lineage.joins(:uniprot_entries => :peptides)
    if equate_il
      l = l.where("peptides.sequence_id = ?", id)
    else
      l = l.where("peptides.original_sequence_id = ?", id)
    end
    l = l.eager_load(:name).preload(Lineage::ORDER_T) if eager
    return l
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
    raise(ArgumentError, ":equate_il must be a boolean") unless is_boolean?(equate_il)
    equate_il ? :peptides : :original_peptides
  end

  def self.lca_t_relation_name(equate_il)
    raise(ArgumentError, ":equate_il must be a boolean") unless is_boolean?(equate_il)
    equate_il ? :lca_il_t : :lca_t
  end

  # search for a single sequence, include information through join tables
  def self.single_search(sequence, equate_il = true)
    raise(ArgumentError, ":equate_il must be a boolean") unless is_boolean?(equate_il)
    raise SequenceTooShortError if sequence.length < 5
    sequence = sequence.gsub(/I/,'L') if equate_il
    # this solves the N+1 query problem
    self.includes(peptides_relation_name(equate_il) => {:uniprot_entry => [:taxon, :ec_cross_references, :go_cross_references]})
      .find_by_sequence(sequence)
  end

  # try to find multiple matches for a single sequence
  def self.advanced_single_search(sequence, equate_il = true)
    raise(ArgumentError, ":equate_il must be a boolean") unless is_boolean?(equate_il)
    # sanity check
    raise NoMatchesFoundError.new(sequence) if sequence.index(/([KR])([^P])/).nil?

    sequence = sequence.gsub(/I/,'L') if equate_il

    # Split in silico (use little trick to fix overlap)
    sequences = sequence.gsub(/([KR])([^P])/,"\\1\n\\2").gsub(/([KR])([^P])/,"\\1\n\\2").lines.map(&:strip).to_a

    # build query
    query = self.includes(peptides_relation_name(equate_il) => {:uniprot_entry => [:taxon, :lineage]})
    long_sequences = sequences.select{|s| s.length >= 5}.map{|s| query.find_by_sequence(s) }

    # check if it has a match for every sequence and at least one long part
    raise NoMatchesFoundError.new(sequence) if long_sequences.include? nil
    raise SequenceTooShortError if long_sequences.size == 0

    long_sequences
  end

  # Returns an array of sequences strings based on a list of sequence id's
  def self.list_sequences(ids)
    Sequence.where(id: ids).pluck(:sequence)
  end

  # Filters a list of sequences for having a given lca
  def self.filter_unique_uniprot_peptides(sequences, lca)
    Sequence.where(id: sequences, lca: lca).order(:id).pluck(:id)
  end

  private

  def self.is_boolean?(variable)
    variable.is_a?(TrueClass) || variable.is_a?(FalseClass)
  end
end

#some errors
class SequenceTooShortError < StandardError; end
class NoMatchesFoundError < StandardError; end
