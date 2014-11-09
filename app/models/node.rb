# Overview of the data in a Node
# - id
# - name
# - children
# - data
#   - title
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

    # TODO: remove
    fix_title
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

  def set_sequences(id, sequences)
    if is_root?
      @sequences[id] = sequences
    else
      @root.set_sequences(id, sequences)
    end
  end

  # adds a number to the count variable
  def add_sequences(sequences)
    @data["count"] += sequences.length
  end

  def add_own_sequences(sequences)
    set_sequences(@id, sequences)
    @data["self_count"] = sequences.length
  end

  def fix_title
    @data["title"] = @name
    @data["title"] += " (" + (@data["self_count"].nil? ? "0" : @data["self_count"].to_s) + "/" + @data["count"].to_s + ")"
  end

  # fix all titles
  def fix_all_titles
    fix_title
    @children.map{|c| c.fix_all_titles} unless @children.empty?
  end

  # Sorts the peptides lists and children alphabetically
  def sort_peptides_and_children
    @children.sort_by!(&:name) unless @children.empty?
    @children.map{|c| c.sort_peptides_and_children} unless @children.empty?
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
