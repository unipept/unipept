require 'set'
# Overview of the data in a Node
# - id
# - name
# - links
class GraphNode
  attr_accessor :id, :name, :parents, :children, :self_support

  def initialize(id, name, support)
    @id = id
    @name = name
    @parents = {}
    @children = {}
    @self_support = support
  end

  def add_parent(node)
    @parents[node.id] = node unless @parents.key?(node.id)
  end

  def add_child(node)
    @children[node.id] = node unless @children.key?(node.id)
  end

  def support
    return @total_support unless @total_support.nil?
    @total_support = @children.values.map(&:support).keep_if{|s| !s.nil?}.inject(Set.new, &:union)
    @total_support = @total_support.union(@self_support) unless @self_support.nil?
    @total_support
  end

  def weight
    support.length
  end

  # used by Oj.dump to exclude the root
  def to_hash
    Hash[instance_variables.map { |var| [var[1..-1].to_sym, instance_variable_get(var)] }]
  end
end
