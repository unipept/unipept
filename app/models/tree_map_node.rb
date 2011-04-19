class TreeMapNode < Node
  
  def initialize(id, name)
    super(id, name)
    @data[:$area] = 0
    @data[:count] = 0
  end
  
  # adds a number to the count variable and recalculates the area
  def add_count(count)
    @data[:count] += count
    @data[:$area] = Math.log10(@data[:count]+1)/Math.log10(2)
  end
end