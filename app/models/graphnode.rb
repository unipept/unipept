require 'set'
# Overview of the data in a Node
# - id
# - name
# - links
class GraphNode
  attr_accessor :id, :name, :links, :linked

  def initialize(id, name)
    @id = id
    @name = name
    @links = {}
    @linked = Set.new
  end

  # returns the added link
  def add_link(link)
    @links[link.id] = link unless @links.key?(link.id)
  end

  # used by Oj.dump to exclude the root
  def to_hash
    Hash[instance_variables.map { |var| [var[1..-1].to_sym, instance_variable_get(var)] }]
  end
end
