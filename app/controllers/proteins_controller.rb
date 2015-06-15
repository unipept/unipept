class ProteinsController < ApplicationController
  include Utils
  include Errors

  def show
    # save parameters
    @p = params

    # set search parameters
    @equate_il = params[:il].present?
    @prot = params[:q]

    # process parameters

    # check for empty searched
    raise EmptyQueryError.new if @prot.blank?

    # sanitize the protein sequence
    @prot = @prot.gsub(/\s+/, "").upcase

    # perform tryptic digest
    sequences = prot2pept(@prot)

    # prepare equate_il mapping and convert
    sequence_mapping = Hash[sequences.map{|v| @equate_il ? [v.gsub(/I/,'L'), v] : [v, v]}]
    sequences = sequences.map{|s| @equate_il ? s.gsub(/I/,'L') : s}

    # build the resultset
    lcas = []

    sequences.each_slice(1000) do |data_slice|
      Sequence.includes({Sequence.lca_t_relation_name(@equate_il) => {:lineage => Lineage::ORDER_T}}).where(sequence: data_slice).each do |sequence|
        lca_t = sequence.calculate_lca(@equate_il, true)
        lcas << lca_t
      end
    end

    @lca_star = Taxon.find_by_id(lca_star lcas.map {|t| t.id})

    rescue EmptyQueryError
      flash[:error] = "Your query was empty, please try again."
      redirect_to search_single_protein_path
  end
end
