class ProteinsController < ApplicationController
  include Utils
  include Errors

  def show
    # save parameters
    @p = params

    # set search parameters
    @prot = params[:q]
    @equate_il = false # always false

    # process parameters

    # check for empty searched
    raise EmptyQueryError.new if @prot.blank?

    # sanitize the protein sequence
    @prot = @prot.gsub(/\s+/, "").upcase

    # perform tryptic digest
    sequences = prot2pept(@prot)
    sequence_to_taxon = Hash.new
    sequence_counts = Hash[sequences.group_by{|k| k}.map{|k,v| [k, v.length]}]
    matches = Hash.new

    # build the resultset
    lcas = []

    sequences.each_slice(1000) do |data_slice|
      Sequence.includes({Sequence.lca_t_relation_name(@equate_il) => {:lineage => Lineage::ORDER_T}}).where(sequence: data_slice).each do |sequence|
        lca_t = sequence.calculate_lca(@equate_il, true)

        lcas << lca_t

        # add to sequence_taxon mapping
        sequence_to_taxon[sequence.sequence] = lca_t

        # treeview data
        num_of_seq = sequence_counts[sequence.sequence]
        matches[lca_t] ||= []
        num_of_seq.times do
          matches[lca_t] << sequence.sequence
        end

      end
    end

    @lca_star = Taxon.find_by_id(lca_star lcas.map {|t| t.id})

    # prepare for output
    @title = "Protein analysis result"
    @intro_text = "Out of #{sequences.size} peptides extracted from the input protein, #{sequence_to_taxon.size} unique peptides were matched"

    # peptides table
    @matches = matches
    @sequences = sequences
    @sequence_to_taxon = sequence_to_taxon

    # construct treemap nodes
    root = Node.new(1, "Organism", nil, "no rank")
    matches.each do |taxon, seqs| # for every match
      lca_l = taxon.lineage

      last_node_loop = root
      while !lca_l.nil? && lca_l.has_next? # process every rank in lineage
        t = lca_l.next_t
        unless t.nil?
          node = Node.find_by_id(t.id, root)
          if node.nil?
            node = Node.new(t.id, t.name, root, t.rank)
            last_node_loop = last_node_loop.add_child(node)
          else
            last_node_loop = node
          end
        end
      end
      node = taxon.id == 1 ? root : Node.find_by_id(taxon.id, root)
      node.set_sequences(seqs) unless node.nil?
    end


    @json_sequences = Oj.dump(root.sequences, mode: :compat)
    root.prepare_for_multitree unless root.nil?
    root.sort_children unless root.nil?
    @json_tree = Oj.dump(root, mode: :compat)

    rescue EmptyQueryError
      flash[:error] = "Your query was empty, please try again."
      redirect_to search_single_protein_path
  end
end
