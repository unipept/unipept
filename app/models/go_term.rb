# == Schema Information
#
# Table name: go_terms
#
#  id        :integer          not null, primary key
#  code      :string(15)       not null
#  namespace :string(18)       not null
#  name      :string(200)      not null
#


class GoTerm < ActiveRecord::Base
  	include ReadOnlyModel
  	attr_accessible nil

  	# constant variable
  	GO_ONTOLOGY = {'biological_process' => 'GO:0008150', 'molecular_function' => 'GO:0003674', 'cellular_component' => 'GO:0005575'}
  	CUTOFF = 0.75

  	def self.go_reachability(support)
    	graphs = {}
    	GO_ONTOLOGY.keys.each{|o| graphs[o] = Graph.new(support)}
    	for go in support.keys
      		node = GO_GRAPH.find_go(go)
      		go_node = graphs[node.namespace].add_reachable(node, Set.new(support[go])) unless node.nil?
      		graphs[node.namespace].hits.append(go_node) unless node.nil?
    	end
    	return graphs
  	end

  	def self.go_tree(graphs)
    	go_tree_build = {}
    	for ont in GO_ONTOLOGY.keys
      		go_tree_build[ont] = graphs[ont].to_tree(GO_ONTOLOGY[ont])
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
