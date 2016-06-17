# == Schema Information
#
# Table name: go_terms
#
#  id        :integer          not null, primary key
#  code      :string(15)       not null
#  name      :string(200)      not null
#  namespace :string(2)        not null
#

class GoTerm < ActiveRecord::Base
  include ReadOnlyModel
  attr_accessible nil

  has_many :go_cross_references

  # constant variable
  GO_ONTOLOGY = {'biological_process' => 'GO:0008150', 'molecular_function' => 'GO:0003674', 'cellular_component' => 'GO:0005575'}

  def self.go_reachability(go_array)
    gos_counts, graphs = {}, {}

    go_array.group_by{|i| i}.each{|k,v| gos_counts[k] = v.count}
    GO_ONTOLOGY.keys.each{|o| graphs[o] = Graph.new(gos_counts)}
    go_array = gos_counts.keys
    for go in go_array
      node = GO_GRAPH.find_go(go)
      graphs[node.namespace].add_reachable(node, go) unless node.nil?
    end
    return gos_counts, graphs
  end

  def self.go_tree_counts(parent)
    parent.data['count'] = parent.data['self_count']
    for child in parent.children
        go_tree_counts(child)
        parent.data['count'] += child.data['count']
    end
  end

  def self.go_tree(graphs)
    go_tree_build = {}
    for ont in GO_ONTOLOGY.keys
      go_tree_build[ont] = graphs[ont].to_tree(GO_ONTOLOGY[ont])
      go_tree_counts(go_tree_build[ont]) unless go_tree_build[ont].nil?
    end
    return go_tree_build
  end

  def self.cutoff(parent, cutoff, lcas)
    if parent.data['count'] >= cutoff
      added = false
      for child in parent.children
        added = cutoff(child, cutoff, lcas) || added # it's essential to put added to the back, otherwise cutoff isn't evaluated
      end
      if !added
        lcas.append(parent)
      end
      return true
    end
    return false
  end
end
