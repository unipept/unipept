class Graph
  attr_accessor :terms

  def initialize
    @terms = Hash.new
  end

  def add_term(term, node)
    @terms[term] = node
  end

  # used by Oj.dump to exclude the root
  def to_hash
    Hash[instance_variables.map { |var| [var[1..-1].to_sym, instance_variable_get(var)] }]
  end

end
