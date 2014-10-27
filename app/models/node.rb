class Node
  attr_accessor :id, :name, :children, :data

  def initialize(id, name, root)
    @id = id
    @name = name
    @root = root
    @children = Array.new
    @data = Hash.new

    # root node
    if id == 1
      @nodes = Array.new
      @sequences = Hash.new
    end
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

  def sequences
    return @sequences
  end

  def set_sequences(id, sequences)
    if @root.nil?
      @sequences[id] = sequences
    else
      @root.set_sequences(id, sequences)
    end
  end

  # used by Oj.dump to exclude the root
  def to_hash()
    hash = Hash[instance_variables.map { |var| [var[1..-1].to_sym, instance_variable_get(var)] }]
    hash.delete(:root)
    hash.delete(:nodes)
    hash.delete(:sequences)
    return hash
  end

  #methods to make the partials render
  def self.model_name
    return Node
  end
  def self.partial_path
    return "nodes/node"
  end
end
