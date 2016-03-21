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
    # We do need to traverse these children, even if we already processed this
    # node, because we need to add a new reachable node.
    parent.linked.add(linked)
    for child in go.parents
      node = add_reachable(child, linked)
      parent.add_link(node)
    end
    parent
  end

  def add_reachable_tree(node, linked)
    child = @terms[node.id]
    if child.nil?
      child = GraphNode.new(node.id, node.name)
      add_term(node.id, child)
    end
    child.linked.add(linked)
    if !node.links.values.empty?
      parent = nil
      for cand in node.links.values
        if parent.nil?
          parent = cand
        end
      end
      child.add_link(add_reachable_tree(parent, linked))
    end
    child
  end

  def to_tree
    tree = Graph.new
    for hit in @terms['GO:0003674'].linked
      tree.add_reachable_tree(@terms[hit], hit)
    end
    tree
  end

end
