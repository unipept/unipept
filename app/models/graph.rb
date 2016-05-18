class Graph
  attr_accessor :terms

  def initialize(counts)
    @terms = Hash.new
    @counts = counts
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

  def add_reachable_tree(node, nodes)
    child = nodes[node.id]
    if child.nil?
      child = Node.new(node.id[3..-1].to_i, node.name, nil, node.id)
      child.data['self_count'] = @counts.include?(node.id) ? @counts[node.id] : 0
      nodes[node.id] = child
    end
    if !node.links.values.empty?
      parent = nil
      weigth = 0
      for cand in node.links.values
        if parent.nil? || weigth < cand.weight
          parent = cand
          weigth = cand.weight
        end
      end
      tree_parent = add_reachable_tree(parent, nodes)
      tree_parent.add_child(child) unless tree_parent.children.include?(child)
    end
    child
  end

  def to_tree(root)
    return nil unless @terms.include?(root)
    nodes = Hash.new
    for hit in @terms[root].linked
      add_reachable_tree(@terms[hit], nodes)
    end
    nodes[root]
  end

end
