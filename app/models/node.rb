class Node
  attr_accessor :id, :name, :children
  
  def initialize(id, name)
    @id = id
    @name = name
    @children = Array.new
  end
  
  #returns the added child
  def add_child(child)
    @children << child
    return child
  end 
  
  def self.find_by_id(id)
    found = nil
    ObjectSpace.each_object(Node) { |o|
      found = o if o.id == id
    }
    return found
  end
end


