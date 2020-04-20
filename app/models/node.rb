require 'json'

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
    @data['self_count'] = 0
    @data['rank'] = rank

    # root node
    return unless root?

    @nodes = []
  end

  def root?
    id == 1
  end

  attr_reader :nodes

  # returns the added child
  def add_child(child)
    n = root? ? @nodes : @root.nodes
    n << child
    @children << child
    child
  end

  # Sorts the children alphabetically
  def sort_children
    @children.sort_by!(&:name)
    @children.map(&:sort_children)
  end

  def get_child(id)
    @children.find { |c| c.id == id }
  end

  def do_count
    @children.each { |c| c.do_count }
    count = @children.reduce(0) { |sum, c| sum + c.data['count'] } + @data['self_count']
    @data['count'] = count
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
