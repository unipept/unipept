class TreeMapNode < Node
  
  GRADIENT = ["#002F2F", "#003638", "#013d40", "#01444a", "#014a52", "#02505c", "#025563", "#025a6e", "#045f75", "#046380"]
  
  def initialize(id, name)
    super(id, name)
    
    #area
    @data[:$area] = 0
    @data[:count] = 0
    
    #color
    @data[:level] = 0
    @data[:$color] = GRADIENT[@data[:level]]
  end
  
  # adds a child to this node and updates the color of the child
  # returns the added child
  def add_child(child, root)
    child.data[:level] = @data[:level]+1 if @data[:level] < 9
    #child.data[:$color] = "#" + child.data[:level].to_s * 6
    child.data[:$color] = GRADIENT[child.data[:level]]
    super(child, root)
  end
  
  # adds a number to the count variable and recalculates the area
  def add_count(count)
    @data[:count] += count
    @data[:$area] = Math.log10(@data[:count]+1)/Math.log10(2)
  end
end