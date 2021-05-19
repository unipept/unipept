# == Schema Information
#
# Table name: lineages
#
#  taxon_id         :integer          unsigned, not null, primary key
#  superkingdom     :integer
#  kingdom          :integer
#  subkingdom       :integer
#  superphylum      :integer
#  phylum           :integer
#  subphylum        :integer
#  superclass       :integer
#  class            :integer
#  subclass         :integer
#  superorder       :integer
#  order            :integer
#  suborder         :integer
#  infraorder       :integer
#  superfamily      :integer
#  family           :integer
#  subfamily        :integer
#  tribe            :integer
#  subtribe         :integer
#  genus            :integer
#  subgenus         :integer
#  species_group    :integer
#  species_subgroup :integer
#  species          :integer
#  subspecies       :integer
#  strain           :integer
#  varietas         :integer
#  forma            :integer
#
class Lineage < ApplicationRecord
  include ReadOnlyModel

  has_many :uniprot_entries,      foreign_key: 'taxon_id',      primary_key: 'taxon_id', class_name: 'UniprotEntry'

  belongs_to :name,               foreign_key: 'taxon_id',      primary_key: 'id',  class_name: 'Taxon'

  belongs_to :superkingdom_t,     foreign_key: 'superkingdom',  primary_key: 'id',  class_name: 'Taxon'
  belongs_to :kingdom_t,          foreign_key: 'kingdom',       primary_key: 'id',  class_name: 'Taxon'
  belongs_to :subkingdom_t,       foreign_key: 'subkingdom',    primary_key: 'id',  class_name: 'Taxon'
  belongs_to :superphylum_t,      foreign_key: 'superphylum',   primary_key: 'id',  class_name: 'Taxon'
  belongs_to :phylum_t,           foreign_key: 'phylum',        primary_key: 'id',  class_name: 'Taxon'
  belongs_to :subphylum_t,        foreign_key: 'subphylum',     primary_key: 'id',  class_name: 'Taxon'
  belongs_to :superclass_t,       foreign_key: 'superclass',    primary_key: 'id',  class_name: 'Taxon'
  belongs_to :class_t,            foreign_key: 'class',         primary_key: 'id',  class_name: 'Taxon'
  belongs_to :subclass_t,         foreign_key: 'subclass',      primary_key: 'id',  class_name: 'Taxon'
  belongs_to :superorder_t,       foreign_key: 'superorder',    primary_key: 'id',  class_name: 'Taxon'
  belongs_to :order_t,            foreign_key: 'order',         primary_key: 'id',  class_name: 'Taxon'
  belongs_to :suborder_t,         foreign_key: 'suborder',      primary_key: 'id',  class_name: 'Taxon'
  belongs_to :infraorder_t,       foreign_key: 'infraorder',    primary_key: 'id',  class_name: 'Taxon'
  belongs_to :superfamily_t,      foreign_key: 'superfamily',   primary_key: 'id',  class_name: 'Taxon'
  belongs_to :family_t,           foreign_key: 'family',        primary_key: 'id',  class_name: 'Taxon'
  belongs_to :subfamily_t,        foreign_key: 'subfamily',     primary_key: 'id',  class_name: 'Taxon'
  belongs_to :tribe_t,            foreign_key: 'tribe',         primary_key: 'id',  class_name: 'Taxon'
  belongs_to :subtribe_t,         foreign_key: 'subtribe',      primary_key: 'id',  class_name: 'Taxon'
  belongs_to :genus_t,            foreign_key: 'genus',         primary_key: 'id',  class_name: 'Taxon'
  belongs_to :subgenus_t,         foreign_key: 'subgenus',      primary_key: 'id',  class_name: 'Taxon'
  belongs_to :species_group_t,    foreign_key: 'species_group', primary_key: 'id',  class_name: 'Taxon'
  belongs_to :species_subgroup_t, foreign_key: 'species_subgroup', primary_key: 'id', class_name: 'Taxon'
  belongs_to :species_t,          foreign_key: 'species',       primary_key: 'id',  class_name: 'Taxon'
  belongs_to :subspecies_t,       foreign_key: 'subspecies',    primary_key: 'id',  class_name: 'Taxon'
  belongs_to :strain_t,           foreign_key: 'strain',        primary_key: 'id',  class_name: 'Taxon'
  belongs_to :varietas_t,         foreign_key: 'varietas',      primary_key: 'id',  class_name: 'Taxon'
  belongs_to :forma_t,            foreign_key: 'forma',         primary_key: 'id',  class_name: 'Taxon'

  ORDER = %i[superkingdom kingdom subkingdom superphylum phylum subphylum
             superclass class_ subclass superorder order suborder
             infraorder superfamily family subfamily tribe
             subtribe genus subgenus species_group species_subgroup
             species subspecies strain varietas forma].freeze

  ORDER_T = %i[superkingdom_t kingdom_t subkingdom_t superphylum_t phylum_t
               subphylum_t superclass_t class_t subclass_t
               superorder_t order_t suborder_t infraorder_t superfamily_t
               family_t subfamily_t tribe_t subtribe_t genus_t subgenus_t
               species_group_t species_subgroup_t species_t subspecies_t strain_t
               varietas_t forma_t].freeze

  ORDER_V1 = %i[superkingdom kingdom subkingdom superphylum phylum subphylum
                superclass class_ subclass infraclass superorder order suborder
                infraorder parvorder superfamily family subfamily tribe
                subtribe genus subgenus species_group species_subgroup
                species subspecies varietas forma].freeze

  ORDER_V1_T = %i[superkingdom_t kingdom_t subkingdom_t superphylum_t phylum_t
                  subphylum_t superclass_t class_t subclass_t infraclass_t
                  superorder_t order_t suborder_t infraorder_t parvorder_t superfamily_t
                  family_t subfamily_t tribe_t subtribe_t genus_t subgenus_t
                  species_group_t species_subgroup_t species_t subspecies_t
                  varietas_t forma_t].freeze

  scope :with_names, -> { includes(ORDER_T) }

  # rails 4.2+ checks the values before using them in queries
  # Eager loading the Taxa results in a range error if there are -1 values
  # http://metaskills.net/2015/01/06/activerecord-42s-type-casting/
  # This code disables the rangecheck for UnsignedIntegers
  module ActiveRecord::Type
    class UnsignedInteger
      def ensure_in_range(value)
        value
      end
    end
  end

  def set_iterator_position(position)
    @iterator = position
  end

  def get_iterator_position
    @iterator
  end

  def has_next?
    @iterator = 0 if @iterator.nil?
    (ORDER.length > @iterator)
  end

  def next
    @iterator = 0 if @iterator.nil?
    result = ORDER[@iterator]
    @iterator += 1
    self[result]
  end

  def next_t
    @iterator = 0 if @iterator.nil?
    result = ORDER_T[@iterator]
    @iterator += 1
    send(result)
  end

  # returns an array containing the lineage names in the right order
  def to_a
    array = ORDER_T.map { |rank| send(rank) }
    array.map { |x| x.nil? ? '' : x.name }
  end

  def self.ranks
    ORDER
  end

  def hits
    self[:hits] || 1
  end

  # returns the Taxon object of the lowest common ancestor
  def self.calculate_lca_taxon(lineages)
    Taxon.find_by(id: Lineage.calculate_lca(lineages))
  end

  # calculates the lowest common ancestor
  # you shouldn't call this method directly but the calculate_lca method on the sequence
  def self.calculate_lca(lineages)
    return -1 if lineages.empty?

    lca = 1 # default lca
    ORDER.each do |rank|
      # only filter nil at species and genus
      current = if %i[species genus].include?(rank)
                  lineages.map(&rank).find_all { |n| n.nil? || n.positive? }.uniq.compact
                else
                  lineages.map(&rank).find_all { |n| n.nil? || n.positive? }.uniq
                end
      return lca if current.length > 1 # more than one distinct element

      lca = current[0] unless current[0].nil? # save lca if this rank isn't nil
    end
    lca
  end

  # builds a tree for a list of lineages. The root node always has id = 1.
  def self.build_tree(frequencies)
    taxa_with_lineage = Taxon.includes(:lineage).where(id: frequencies.keys)

    root = Node.new(1, 'Organism', nil, 'no rank') # start constructing the tree
    taxa_with_lineage.each do |taxon|
      current_node = root
      puts taxon.inspect

      Lineage.ranks.each do |rank|
        lineage_id = taxon.lineage.send(rank)

        next unless lineage_id && lineage_id >= 0

        child = current_node.get_child(lineage_id)

        unless child
          taxon_info = Taxon.find(lineage_id)
          child = Node.new(lineage_id, taxon_info.name, root, rank)
          current_node.add_child(child)
        end

        current_node = child
      end

      current_node.data['self_count'] += frequencies.fetch(taxon.id, 0)
    end

    root.do_count
    root
  end

  # there's a column 'class' in the database which screws
  # up the getters. This method fixes that error.
  def self.instance_method_already_implemented?(method_name)
    return true if method_name == 'class'

    super
  end

  def class_
    self[:class]
  end
end
