# == Schema Information
#
# Table name: go_terms
#
#  id        :integer          not null, primary key
#  code      :string(15)       not null
#  namespace :string(18)       not null
#  name      :string(200)      not null
#

class GoTerm < ApplicationRecord
  include ReadOnlyModel

  # constant variable
  GO_ONTOLOGY = {'biological_process' => 'GO:0008150', 'molecular_function' => 'GO:0003674', 'cellular_component' => 'GO:0005575'}
  CUTOFF = 0.75

  def self.go_reachability(go_uniprot_map)
    graphs = {}
    GO_ONTOLOGY.keys.each{|o| graphs[o] = Graph.new()}
    go_uniprot_map.each do |go, uni_id|
      go_path = GO_GRAPH.find_go(go)
      if !go_path.nil?
        go_node = graphs[go_path.namespace].add_reachable(go_path, Set.new(uni_id))
        graphs[go_path.namespace].hits.append(go_node)
      end
    end
    return graphs
  end

  def self.go_tree(graphs)
    go_tree_build = {}
    GO_ONTOLOGY.each do |ont, go|
        go_tree_build[ont] = graphs[ont].to_tree(go)
    end
    return go_tree_build
  end

  # TODO: remove lcas argument
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
