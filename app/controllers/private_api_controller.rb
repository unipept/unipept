class PrivateApiController < HandleOptionsController
  before_action :set_headers, only: %i[goterms ecnumbers interpros taxa proteins]
  before_action :default_format_json
  skip_before_action :verify_authenticity_token

  def goterms
    go_terms = params[:goterms] || []
    @goterms = GoTerm.where(code: go_terms)
  end

  def ecnumbers
    ec_nrs = params[:ecnumbers]
    @ecnumbers = EcNumber.where(code: ec_nrs)
  end

  def interpros
    interpro_entries = params[:interpros]
    @interpros = InterproEntry.where(code: interpro_entries)
  end

  def taxa
    taxids = params[:taxids] || []
    @taxa = Taxon.includes(:lineage).where(id: taxids)
  end

  def proteins
    # process parameters
    # the sequence or id of the peptide (filter out all characters that are non-ASCII)
    seq = params[:peptide].upcase.gsub(/\P{ASCII}/, '')
    # should we equate I and L? (true by default)
    equate_il = params.has_key?(:equate_il) ? params[:equate_il] : true

    # process the input, convert seq to a valid @sequence
    sequence = Sequence.single_search(seq, equate_il)
    @original_sequence = seq

    if sequence.present? && sequence.peptides(equate_il).empty?
      @entries = []
      return
    end

    # get the uniprot entries of every peptide
    # only used for the open in uniprot links
    # and calculate the LCA
    if sequence.nil?
      # we didn't find the sequence in the database, so let's try to split it
      long_sequences = Sequence.advanced_single_search(seq, equate_il)
      # calculate possible uniprot entries
      temp_entries = long_sequences.map { |s| s.peptides(equate_il).map(&:uniprot_entry).to_set }
      # take the intersection of all sets
      @entries = temp_entries.reduce(:&)
      # check if the protein contains the startsequence
      @entries.select! { |e| e.protein_contains?(seq, equate_il) }

      # Calculate fa summary
      @fa_summary = UniprotEntry.summarize_fa(@entries)

      return if @entries.empty?
    else
      @entries = sequence.peptides(equate_il).map(&:uniprot_entry)
      @lineages = sequence.lineages(equate_il, true).to_a

      # Get FA summary form cache
      @fa_summary = sequence.calculate_fa(equate_il)
    end

    # sort entries
    @entries = @entries.to_a.sort_by { |e| e.taxon.nil? ? '' : e.taxon.name }
  end

  private

  def default_format_json
    request.format = 'json'
  end
end
