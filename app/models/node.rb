class Node
  attr_accessor :id, :name, :children, :data
  
  @@nodes = Array.new
  
  def initialize(id, name)
    @id = id
    @name = name
    @children = Array.new
    @data = Hash.new
    @data[:$area] = 0
    @data[:count] = 0
  end
  
  #returns the added child
  def add_child(child)
    @@nodes << child
    @children << child
    return child
  end 
  
  def add_count(count)
    @data[:count] += count
    @data[:$area] = Math.log2(@data[:count]+1)
  end
  
  def self.find_by_id(id)
    found = nil
    @@nodes.each { |o|
      found = o if o.id == id
    }
    return found
  end
end


