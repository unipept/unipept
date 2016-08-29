class Graph
  attr_accessor :terms, :hits

  def initialize(support)
    @terms = Hash.new
    @hits = []
  end

  def add_term(term, node)
    @terms[term] = node
  end

  # used by Oj.dump to exclude the root
  def to_hash
    Hash[instance_variables.map { |var| [var[1..-1].to_sym, instance_variable_get(var)] }]
  end

  def add_reachable(go, support)
    return nil if go.nil?

    parent = @terms[go.id]
    return parent unless parent.nil?

    go_name = go.name.gsub "_", " "
    parent = GraphNode.new(go.id, go_name, support)
    add_term(go.id, parent)

    for child in go.parents
      node = add_reachable(child, nil)
      parent.add_parent(node)
      node.add_child(parent)
    end

    parent
  end

  def add_reachable_tree(node, nodes)
    child = nodes[node.id]
    if child.nil?
      child = Node.new(node.id[3..-1].to_i, node.name, nil, node.id)
      child.data['self_count'] = node.self_support.nil? ? 0 : node.self_support.length
      child.data['count'] = node.weight
      nodes[node.id] = child
    end
    if !node.parents.values.empty?
      parent = nil
      weight = 0
      for cand in node.parents.values
        if parent.nil? || weight < cand.weight
          parent = cand
          weight = cand.weight
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
    for hit in @hits
      add_reachable_tree(hit, nodes)
    end
    nodes[root]
  end
end
