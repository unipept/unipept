class TreeMapNode < Node
  #:metadata contains the sequences
  attr_accessor :state, :metadata, :attr
  
  GRADIENT = Hash["no rank", "#933b19", "superkingdom", "#97411a", "kingdom", "#9b481b", "subkingdom", "#9f4e1d", "superphylum", "#a3551e", "phylum", "#a75c1f", "subphylum", "#ab6321", "superclass", "#ae6a22", "class", "#b27224", "subclass", "#b67925", "infraclass", "#ba8126", "superorder", "#bd8928", "order", "#c19129", "suborder", "#c5992b", "infraorder", "#c8a22d", "parvorder", "#ccaa2e", "superfamily", "#cfb230", "family", "#d0b935", "subfamily", "#d0bf3a", "tribe", "#d0c53f", "subtribe", "#d1ca44", "genus", "#d1cf48", "subgenus", "#cfd24d", "species group", "#cbd252", "species subgroup", "#c8d356", "species", "#c5d35b", "subspecies", "#c2d460", "varietas", "#bfd464", "forma", "#bdd569"]
  
  def initialize(id, name, rank="root")
    super(id, name)
    
    #area
    @data[:$area] = 0
    @data[:count] = 0
    
    @metadata = Hash.new
    @metadata[:all_sequences] = Array.new
    
    @attr = Hash.new
    @attr[:title] = rank
    @data[:rank] = rank
    @metadata[:id] = id
    
    #color
    @data[:level] = 0
    @data[:$color] = GRADIENT[rank]
    
    fix_title_and_state
  end
  
  # adds a child to this node and updates the color of the child
  # returns the added child
  def add_child(child, root)
    child.data[:level] = @data[:level]+1 
    super(child, root)
  end
  
  # adds a number to the count variable and recalculates the area
  def add_sequences(sequences)
    @metadata[:all_sequences].concat(sequences) 
    
    @data[:count] += sequences.length
    @data[:$area] = Math.log10(@data[:count]+1)/Math.log10(2)
    
    fix_title_and_state
  end
  
  def add_own_sequences(sequences)
    @data[:self_count] = sequences.length
    @metadata[:own_sequences] = sequences
  end
  
  def fix_title_and_state
    @data[:title] = @name
    if @children.length != 0
      @data[:title] += " (" + (@data[:self_count].nil? ? "0" : @data[:self_count].to_s) + "/" + @data[:count].to_s + ")" 
    else
      @data[:title] += " (" + @data[:count].to_s + ")" 
    end
      
    @state = @data[:level] <= 3 ? "open" : "closed"
  end
  
  # Adds a URL to every node linking to a piechart of their children
  def add_piechart_data
    unless @children.empty?
      @data[:piecharturl] = "http://chart.apis.google.com/chart?chs=300x225&cht=p&chd=t:"
      @data[:piecharturl] += @children.map{|c| c.data[:count].to_s}.join(",")
      @data[:piecharturl] += "&chdl="
      @data[:piecharturl] += @children.map{|c| c.name + " (" + c.data[:count].to_s + ")"}.join("|")
      @data[:piecharturl] += "&chds=0,"
      @data[:piecharturl] += @children.map{|c| c.data[:count]}.max.to_s
      @children.map{|c| c.add_piechart_data}
    end
  end
  
  # Sorts the peptides lists and children alphabetically
  def sort_peptides_and_children
    @children.sort_by!(&:name) unless @children.empty?
    @metadata[:all_sequences].sort! unless @metadata[:all_sequences].nil?
    @metadata[:own_sequences].sort! unless @metadata[:own_sequences].nil?
    @children.map{|c| c.sort_peptides_and_children} unless @children.empty?
  end

  # cleans a hash of redundant data for sunburst
  def self.clean_sunburst!(hash)
    hash["children"].map{|c| TreeMapNode.clean_sunburst!(c)} unless hash["children"].nil?
    hash.delete("metadata")
    hash.delete("state")
    hash.delete("nodes")
    hash["data"].delete("title")
    hash["data"].delete("piecharturl")
    hash["data"].delete("level")
    hash["data"].delete("$color")
    hash["data"].delete("$area")
    hash["data"].delete("rank")
  end
  
  # cleans a hash of redundant data for sunburst
  def self.clean_treemap!(hash)
    hash.delete("nodes")
  end
end