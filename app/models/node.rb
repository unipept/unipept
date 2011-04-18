class Node
  attr_accessor :id, :name, :children, :data
    
  def initialize(id, name)
    @id = id
    @name = name
    @children = Array.new
    @data = Hash.new
    @data[:$area] = 0
    @data[:count] = 0
    @nodes = Array.new if id == 0
  end
  
  #returns the added child
  def add_child(child, root)
    root.nodes << child
    @children << child
    return child
  end 
  
  def add_count(count)
    @data[:count] += count
    @data[:$area] = Math.log10(@data[:count]+1)/Math.log10(2)
  end
  
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
end


