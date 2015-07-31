# Overview of the data in a Node
# - id
# - name
# - children
# - data
#   - count
#   - self_count
#   - rank
#   - taxon_id
class Node
  attr_accessor :id, :name, :children, :data

  def initialize(id, name, root, rank = '')
    @id = id
    @name = name
    @root = root
    @children = []

    @data = {}
    @data['count'] = 0
    @data['rank'] = rank

    # root node
    return unless root?
    @nodes = []
    @sequences = {}
  end

  def root?
    id == 1
  end

  attr_reader :nodes

  attr_reader :sequences

  # returns the added child
  def add_child(child)
    n = root? ? @nodes : @root.nodes
    n << child
    @children << child
    child
  end

  def set_sequences(sequences, id = @id)
    if root?
      @sequences[id] = sequences
    else
      @root.set_sequences(sequences, id)
    end
  end

  # Sorts the children alphabetically
  def sort_children
    @children.sort_by!(&:name)
    @children.map(&:sort_children)
  end

  # sets the count and self_count
  def prepare_for_multitree
    r = root? ? self : @root
    @children.map(&:prepare_for_multitree)
    @data['self_count'] = r.sequences[@id].nil? ? 0 : r.sequences[@id].size
    count = @children.reduce(0) { |a, e| a + e.data['count'] }
    @data['count'] = @data['self_count'] + count
  end

  # used by Oj.dump to exclude the root
  def to_hash
    hash = Hash[instance_variables.map { |var| [var[1..-1].to_sym, instance_variable_get(var)] }]
    hash.delete(:root)
    hash.delete(:nodes)
    hash.delete(:sequences)
    hash
  end

  # find a node by id within the current tree
  def self.find_by_id(id, root)
    found = nil
    root.nodes.each do |o|
      found = o if o.id == id
    end
    found
  end

  # methods to make the partials render
  def self.model_name
    Node
  end
  def self.partial_path
    'nodes/node'
  end
end
