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

    # build the sequence hash
    sequence_hash = {}
    sequences.each{|s| sequence_hash[s] = nil}

    # build the resultset
    lcas = []

    sequences.each_slice(1000) do |data_slice|
      Sequence.includes({Sequence.lca_t_relation_name(@equate_il) => {:lineage => Lineage::ORDER_T}}).where(sequence: data_slice).each do |sequence|
        lca_t = sequence.calculate_lca(@equate_il, true)

        lcas << lca_t
        sequence_hash[sequence.sequence] = lca_t
      end
    end

    @lca_star = Taxon.find_by_id(lca_star lcas.map {|t| t.id})

    # prepare for output
    @title = "Protein analysis result"
    @sequence_hash = sequence_hash

    rescue EmptyQueryError
      flash[:error] = "Your query was empty, please try again."
      redirect_to search_single_protein_path
  end
end
