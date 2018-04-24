require 'test_helper'

class SequencesControllerTest < ActionController::TestCase
  test 'should get index' do
    Sequence.per_page = 1
    get :index
    assert_response :success
    assert_template :index
    assert_not_nil assigns(:sequences)
    assert_equal 'All sequences', assigns(:title)
  end

  test 'should redirect to search with il' do
    get :search, params: { q: 'AALER', il_s: 'equateIL' }
    assert_redirected_to sequences_path + '/AALER/equateIL'
  end

  test 'should redirect to search without il' do
    get :search, params: { q: 'AALER' }
    assert_redirected_to sequences_path + '/AALER/'
  end

  test 'should redirect to search page with error' do
    get :search, params: { q: '' }
    assert_equal 'Your query was empty, please try again.', flash[:error]
    assert_redirected_to search_single_path
  end

  test 'should get show with id' do
    sequence = sequences(:sequence4)
    taxon1 = taxons(:taxon1)
    taxon2 = taxons(:taxon2)
    get :show, params: { id: 4 }
    assert_response :success
    assert_template :show
    assert_equal sequence.sequence, assigns(:original_sequence)
    assert_equal "Tryptic peptide analysis of #{sequence.sequence}", assigns(:title)
    assert_equal sequence.original_peptides.map(&:uniprot_entry), assigns(:entries)
    assert_equal sequence.original_peptides.map(&:uniprot_entry).map(&:lineage).sort_by(&:taxon_id), assigns(:lineages).to_a.sort_by(&:taxon_id)
    assert_equal sequence.lca_t, assigns(:lca_taxon)
    assert_not_nil assigns(:root)
    assert_equal [taxon2, taxon1], assigns(:common_lineage)
    assert_equal [[taxon2, taxon1], [taxon2, nil]], assigns(:table_lineages)
    assert_equal %w[Organism kingdom species], assigns(:table_ranks)
  end

  test 'should get show with peptide' do
    sequence = sequences(:sequence4)
    taxon1 = taxons(:taxon1)
    taxon2 = taxons(:taxon2)
    get :show, params: { id: 'AAILER' }
    assert_response :success
    assert_template :show
    assert_equal sequence.sequence, assigns(:original_sequence)
    assert_equal "Tryptic peptide analysis of #{sequence.sequence}", assigns(:title)
    assert_equal sequence.original_peptides.map(&:uniprot_entry), assigns(:entries)
    assert_equal sequence.original_peptides.map(&:uniprot_entry).map(&:lineage).sort_by(&:taxon_id), assigns(:lineages).to_a.sort_by(&:taxon_id)
    assert_equal sequence.lca_t, assigns(:lca_taxon)
    assert_not_nil assigns(:root)
    assert_equal [taxon2, taxon1], assigns(:common_lineage)
    assert_equal [[taxon2, taxon1], [taxon2, nil]], assigns(:table_lineages)
    assert_equal %w[Organism kingdom species], assigns(:table_ranks)
  end

  test 'should get show with distinct lineage' do
    get :show, params: { id: 7 }
    assert_response :success
    assert_template :show
  end

  test 'should get show with lowercase peptide' do
    sequence = sequences(:sequence4)
    taxon1 = taxons(:taxon1)
    taxon2 = taxons(:taxon2)
    get :show, params: { id: 'aailer' }
    assert_response :success
    assert_template :show
    assert_equal sequence.sequence, assigns(:original_sequence)
    assert_equal "Tryptic peptide analysis of #{sequence.sequence}", assigns(:title)
    assert_equal sequence.original_peptides.map(&:uniprot_entry), assigns(:entries)
    assert_equal sequence.original_peptides.map(&:uniprot_entry).map(&:lineage).sort_by(&:taxon_id), assigns(:lineages).to_a.sort_by(&:taxon_id)
    assert_equal sequence.lca_t, assigns(:lca_taxon)
    assert_not_nil assigns(:root)
    assert_equal [taxon2, taxon1], assigns(:common_lineage)
    assert_equal [[taxon2, taxon1], [taxon2, nil]], assigns(:table_lineages)
    assert_equal %w[Organism kingdom species], assigns(:table_ranks)
  end

  test 'should get show with id and il' do
    sequence = sequences(:sequence5)
    taxon1 = taxons(:taxon1)
    taxon2 = taxons(:taxon2)
    get :show, params: { id: 5, equate_il: 'equateIL' }
    assert_response :success
    assert_template :show
    assert_equal sequence.sequence, assigns(:original_sequence)
    assert_equal "Tryptic peptide analysis of #{sequence.sequence}", assigns(:title)
    assert_equal sequence.peptides.map(&:uniprot_entry), assigns(:entries)
    assert_equal sequence.peptides.map(&:uniprot_entry).map(&:lineage).sort_by(&:taxon_id), assigns(:lineages).to_a.sort_by(&:taxon_id)
    assert_equal sequence.lca_il_t, assigns(:lca_taxon)
    assert_not_nil assigns(:root)
    assert_equal [taxon2, taxon1], assigns(:common_lineage)
    assert_equal [[taxon2, taxon1], [taxon2, nil]], assigns(:table_lineages)
    assert_equal %w[Organism kingdom species], assigns(:table_ranks)
  end

  test 'should get show with peptide and il' do
    sequence = sequences(:sequence5)
    taxon1 = taxons(:taxon1)
    taxon2 = taxons(:taxon2)
    get :show, params: { id: 'AAILER', equate_il: 'equateIL' }
    assert_response :success
    assert_template :show
    assert_equal @request.parameters[:id], assigns(:original_sequence)
    assert_equal "Tryptic peptide analysis of #{@request.parameters[:id]}", assigns(:title)
    assert_equal sequence.peptides.map(&:uniprot_entry), assigns(:entries)
    assert_equal sequence.peptides.map(&:uniprot_entry).map(&:lineage).sort_by(&:taxon_id), assigns(:lineages).to_a.sort_by(&:taxon_id)
    assert_equal sequence.lca_il_t, assigns(:lca_taxon)
    assert_not_nil assigns(:root)
    assert_equal [taxon2, taxon1], assigns(:common_lineage)
    assert_equal [[taxon2, taxon1], [taxon2, nil]], assigns(:table_lineages)
    assert_equal %w[Organism kingdom species], assigns(:table_ranks)
  end

  test 'should get show with misscleavage and partial peptide' do
    sequence = sequences(:sequence5)
    taxon1 = taxons(:taxon1)
    taxon2 = taxons(:taxon2)
    get :show, params: { id: 'AAILERA' }
    assert_response :success
    assert_template :show
    assert_equal @request.parameters[:id], assigns(:original_sequence)
    assert_equal "Tryptic peptide analysis of #{@request.parameters[:id]}", assigns(:title)
    assert_equal sequence.peptides.map(&:uniprot_entry), assigns(:entries)
    assert_equal sequence.peptides.map(&:uniprot_entry).map(&:lineage), assigns(:lineages).to_a
    assert_equal sequence.lca_il_t, assigns(:lca_taxon)
    assert_not_nil assigns(:root)
    assert_equal [taxon2, taxon1], assigns(:common_lineage)
    assert_equal [[taxon2, nil], [taxon2, taxon1]], assigns(:table_lineages)
    assert_equal %w[Organism kingdom species], assigns(:table_ranks)
  end

  test 'should get show with misscleavage and 2 peptides' do
    sequence = sequences(:sequence5)
    sequence6 = sequences(:sequence6)
    taxon2 = taxons(:taxon2)
    get :show, params: { id: 'AAILERAGGAR' }
    assert_response :success
    assert_template :show
    assert_equal @request.parameters[:id], assigns(:original_sequence)
    assert_equal "Tryptic peptide analysis of #{@request.parameters[:id]}", assigns(:title)
    assert_equal sequence.peptides.map(&:uniprot_entry) & sequence6.peptides.map(&:uniprot_entry), assigns(:entries)
    assert_equal((sequence.peptides.map(&:uniprot_entry) & sequence6.peptides.map(&:uniprot_entry)).map(&:lineage), assigns(:lineages).to_a)
    assert_equal taxon2, assigns(:lca_taxon)
    assert_not_nil assigns(:root)
    assert_equal [taxon2], assigns(:common_lineage)
    assert_equal [[taxon2]], assigns(:table_lineages)
    assert_equal %w[Organism kingdom], assigns(:table_ranks)
  end

  test 'show should error when id not found' do
    get :show, params: { id: -1 }
    assert_equal 'The sequence you searched for is too short.', flash[:error]
    assert_redirected_to search_single_url
  end

  test 'show should error when peptide not found' do
    get :show, params: { id: 'LSKDLSQDFLSQDFS' }
    assert flash[:error].start_with? 'No matches for peptide'
    assert_redirected_to search_single_url
  end

  test 'show should error when peptide too short' do
    get :show, params: { id: 'AA' }
    assert_equal 'The sequence you searched for is too short.', flash[:error]
    assert_redirected_to search_single_url
  end
end
