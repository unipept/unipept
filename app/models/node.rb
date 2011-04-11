class Node
  attr_accessor :id, :name, :children
  
  @@nodes = Array.new
  
  def initialize(id, name)
    @id = id
    @name = name
    @children = Array.new
  end
  
  #returns the added child
  def add_child(child)
    @@nodes << child
    @children << child
    return child
  end 
  
  def self.find_by_id(id)
    found = nil
    @@nodes.each { |o|
      found = o if o.id == id
    }
    return found
  end
end


