require 'set'
# Overview of the data in a Node
# - id
# - name
# - links
class GraphNode
  attr_accessor :id, :name, :links

  def initialize(id, name)
    @id = id
    @name = name
    @links = Hash.new
  end

  # returns the added link
  def add_link(link)
    @links[link.id] = link
  end

  # used by Oj.dump to exclude the root
  def to_hash
    Hash[instance_variables.map { |var| [var[1..-1].to_sym, instance_variable_get(var)] }]
  end

end
