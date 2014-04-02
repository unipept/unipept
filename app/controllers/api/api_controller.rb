class Api::ApiController < ApplicationController

  respond_to :json

  before_filter :set_params, only: [:single, :lca]

  def set_params
    @sequences = params[:sequences].map(&:chomp)
    @equate_il = (!params[:equate_il].blank? && params[:equate_il] == 'true')
    @full_lineage = (!params[:full_lineage].blank? && params[:full_lineage] == 'true')
  end

  def single
    @result = {}
    @sequences.each do |s|
      peptides = Sequence.single_search(s.upcase, @equate_il)
      if peptides
        entries = peptides.peptides.map(&:uniprot_entry)

        @result[s] = Taxon.includes(lineage: Lineage::ORDER_T).find(entries.map(&:taxon_id))
      end
    end

    respond_with(@result)
  end

  def lca
    @result = {}
    @sequences.map do |s|
      sequence = Sequence.single_search(s.upcase, @equate_il)
      name = @equate_il ? :lca_il : :lca
      @result[s] = Taxon.includes(lineage: Lineage::ORDER_T).find(sequence.send(name)) if sequence
    end

    respond_with(@result)
  end

  def taxa2lca
    @taxon_ids = params[:taxon_ids].map(&:chomp)
    @equate_il = (!params[:equate_il].blank? && params[:equate_il] == 'true')
    @full_lineage = (!params[:full_lineage].blank? && params[:full_lineage] == 'true')

    name = @equate_il ? :lca_il : :lca
    lineages = Taxon.includes(lineage: Lineage::ORDER_T).find(@taxon_ids).map(&:lineage)
    @result = Lineage.calculate_lca_taxon(lineages)

    respond_with(@result)
  end

  def pept2pro
    @result = {}
    @sequences = params[:sequences].map(&:chomp)
    @equate_il = (!params[:equate_il].blank? && params[:equate_il] == 'true')

    @sequences.map do |s|
      peptides = Sequence.single_search(s.upcase, @equate_il)
      @result[s] =  peptides.peptides.map(&:uniprot_entry) if peptides
    end

    respond_with(@result)
  end

end
