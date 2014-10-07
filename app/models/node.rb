class Node
  attr_accessor :id, :name, :children, :data

  def initialize(id, name)
    @id = id
    @name = name
    @children = Array.new
    @data = Hash.new
    @nodes = Array.new if id == 1
  end

  # returns the added child
  def add_child(child, root)
    root.nodes << child
    @children << child
    return child
  end

  # find a node by id within the current tree
  def self.find_by_id(id, root)
    found = nil
    root.nodes.each { |o|
      found = o if o.id == id
    }
    return found
  end

  def nodes
    return @nodes
  end

  #methods to make the partials render
  def self.model_name
    return Node
  end
  def self.partial_path
    return "nodes/node"
  end
end
