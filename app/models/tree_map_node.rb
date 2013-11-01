# Overview of the data in a TreeMapNode
# - id
# - name
# - children
# - data
#   - title
#   - $area
#   - $color
#   - count
#   - self_count
#   - level
#   - piecharturl
#   - rank
#   - taxon_id
#   - all_sequences
#   - own_sequences
# - nodes
class TreeMapNode < Node

  # Gradients for the treemap
  GRADIENT = Hash["no rank", "#242a42", "superkingdom", "#26314a", "kingdom", "#283851", "subkingdom", "#294059", "superphylum", "#2b4760", "phylum", "#2d4f67", "subphylum", "#2f576d", "superclass", "#315e74", "class", "#35667a", "subclass", "#386e7f", "infraclass", "#3d7685", "superorder", "#427e8a", "order", "#48868e", "suborder", "#4f8e93", "infraorder", "#579697", "parvorder", "#5f9e9a", "superfamily", "#68a69e", "family", "#72aea1", "subfamily", "#7db6a5", "tribe", "#88bea8", "subtribe", "#93c5ab", "genus", "#9fcdae", "subgenus", "#abd4b2", "species group", "#b8dcb5", "species subgroup", "#c5e3b9", "species", "#d3eabd", "subspecies", "#e1f1c2", "varietas", "#eff8c7", "forma", "#fdffcc"]

  def initialize(id, name, rank="root")
    super(id, name)

    #area
    @data["$area"] = 0
    @data["count"] = 0

    @data["all_sequences"] = Array.new
    @data["taxon_id"] = id

    @data["rank"] = rank

    #color
    @data["level"] = 0
    @data["$color"] = GRADIENT[rank]

    fix_title
  end

  # adds a child to this node and updates the color of the child
  # returns the added child
  def add_child(child, root)
    child.data["level"] = @data["level"]+1
    super(child, root)
  end

  # adds a number to the count variable and recalculates the area
  def add_sequences(sequences)
    @data["all_sequences"].concat(sequences)

    @data["count"] += sequences.length
    @data["$area"] = Math.log10(@data["count"]+1)/Math.log10(2)
  end

  def add_own_sequences(sequences)
    @data["self_count"] = sequences.length
    @data["own_sequences"] = sequences
  end

  def fix_title
    @data["title"] = @name
    @data["title"] += " (" + (@data["self_count"].nil? ? "0" : @data["self_count"].to_s) + "/" + @data["count"].to_s + ")"
  end

  # Adds a URL to every node linking to a piechart of their children
  # also fixes the title, this is somewhat of hack
  def add_piechart_data
    fix_title
    unless @children.empty?
      @children.map{|c| c.add_piechart_data}
      if @children.size > 1
        @data["piecharturl"] = "http://chart.apis.google.com/chart?chs=300x225&cht=p&chd=t:"
        @data["piecharturl"] += @children.map{|c| c.data["count"].to_s}.join(",")
        @data["piecharturl"] += "&chdl="
        @data["piecharturl"] += @children.map{|c| c.name + " (" + c.data["count"].to_s + ")"}.join("|")
        @data["piecharturl"] += "&chds=0,"
        @data["piecharturl"] += @children.map{|c| c.data["count"]}.max.to_s
      end
    end
  end

  # Sorts the peptides lists and children alphabetically
  def sort_peptides_and_children
    @children.sort_by!(&:name) unless @children.empty?
    @data["all_sequences"].sort! unless @data["all_sequences"].nil?
    @data["own_sequences"].sort! unless @data["own_sequences"].nil?
    @children.map{|c| c.sort_peptides_and_children} unless @children.empty?
  end

  # cleans a hash of redundant data for sunburst
  def self.clean_sunburst!(hash)
    hash["children"].map{|c| TreeMapNode.clean_sunburst!(c)} unless hash["children"].nil?
    hash.delete("nodes")
    hash["data"].delete("title")
    hash["data"].delete("piecharturl")
    hash["data"].delete("level")
    hash["data"].delete("$color")
    hash["data"].delete("$area")
    hash["data"].delete("all_sequences")
    hash["data"].delete("own_sequences")
    hash["data"].delete("taxon_id")
  end

  # cleans a hash of redundant data for sunburst
  def self.clean_treemap!(hash)
    hash.delete("nodes")
  end
end