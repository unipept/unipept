class Graph
  attr_accessor :terms

  def initialize
    @terms = Hash.new
  end

  def add_term(term, node)
    @terms[term] = node
  end

  # used by Oj.dump to exclude the root
  def to_hash
    Hash[instance_variables.map { |var| [var[1..-1].to_sym, instance_variable_get(var)] }]
  end

  def add_reachable(go, linked)
    return nil if go.nil?
    parent = @terms[go.id]
    if parent.nil?
      parent = GraphNode.new(go.id, go.name)
      add_term(go.id, parent)
    end
    parent.linked.add(linked)
    for child in go.parents
      node = add_reachable(child, linked)
      parent.add_link(node)
    end
    parent
  end

end
