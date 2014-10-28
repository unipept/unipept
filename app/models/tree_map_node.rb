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
# - nodes
class TreeMapNode < Node

  def initialize(id, name, root, rank="root")
    super(id, name, root)

    @data["count"] = 0

    @data["rank"] = rank

    fix_title
  end

  # adds a child to this node and updates the color of the child
  # returns the added child
  def add_child(child, root)
    super(child, root)
  end

  # adds a number to the count variable
  def add_sequences(sequences)
    @data["count"] += sequences.length
  end

  def add_own_sequences(sequences)
    set_sequences(@id, sequences)
    @data["self_count"] = sequences.length
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
    @children.map{|c| c.sort_peptides_and_children} unless @children.empty?
  end
end