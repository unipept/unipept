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

  def initialize(id, name, root, rank="")
    @id = id
    @name = name
    @root = root
    @children = Array.new

    @data = Hash.new
    @data["count"] = 0
    @data["rank"] = rank

    # root node
    if is_root?
      @nodes = Array.new
      @sequences = Hash.new
    end
  end

  def is_root?
    return id == 1
  end

  def nodes
    return @nodes
  end

  def sequences
    return @sequences
  end

  # returns the added child
  def add_child(child)
    n = is_root? ? @nodes : @root.nodes
    n << child
    @children << child
    return child
  end

  def set_sequences(sequences, id = @id)
    if is_root?
      @sequences[id] = sequences
    else
      @root.set_sequences(sequences, id)
    end
  end

  # Sorts the children alphabetically
  def sort_children
    @children.sort_by!(&:name)
    @children.map{|c| c.sort_children}
  end

  # sets the count and self_count
  def prepare_for_multitree
    r = is_root? ? self : @root
    @children.map(&:prepare_for_multitree)
    @data["self_count"] = r.sequences[@id].nil? ? 0 : r.sequences[@id].size
    count = @children.reduce(0){ |sum, n| sum + n.data["count"]}
    @data["count"] = @data["self_count"] + count
  end

  # used by Oj.dump to exclude the root
  def to_hash()
    hash = Hash[instance_variables.map { |var| [var[1..-1].to_sym, instance_variable_get(var)] }]
    hash.delete(:root)
    hash.delete(:nodes)
    hash.delete(:sequences)
    return hash
  end

  # find a node by id within the current tree
  def self.find_by_id(id, root)
    found = nil
    root.nodes.each { |o|
      found = o if o.id == id
    }
    return found
  end

  #methods to make the partials render
  def self.model_name
    return Node
  end
  def self.partial_path
    return "nodes/node"
  end
end
