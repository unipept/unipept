# Overview of the data in a TreeMapNode
# - id
# - name
# - children
# - data
#   - title
#   - count
#   - self_count
#   - rank
#   - taxon_id
#   - all_sequences
#   - own_sequences
# - nodes
class TreeMapNode < Node

  def initialize(id, name, rank="root")
    super(id, name)

    #area
    @data["count"] = 0

    @data["all_sequences"] = Array.new
    @data["taxon_id"] = id

    @data["rank"] = rank

    fix_title
  end

  # adds a child to this node and updates the color of the child
  # returns the added child
  def add_child(child, root)
    super(child, root)
  end

  # adds a number to the count variable and recalculates the area
  def add_sequences(sequences)
    @data["all_sequences"].concat(sequences)

    @data["count"] += sequences.length
  end

  def add_own_sequences(sequences)
    @data["self_count"] = sequences.length
    @data["own_sequences"] = sequences
  end

  def fix_title
    @data["title"] = @name
    @data["title"] += " (" + (@data["self_count"].nil? ? "0" : @data["self_count"].to_s) + "/" + @data["count"].to_s + ")"
  end

  # fix all titles
  def fix_all_titles
    fix_title
    @children.map{|c| c.fix_all_titles} unless @children.empty?
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
    hash["data"].delete("all_sequences")
    hash["data"].delete("own_sequences")
    hash["data"].delete("taxon_id")
  end

  # cleans a hash of redundant data for treemap
  def self.clean_treemap!(hash)
    hash.delete("nodes")
  end
end