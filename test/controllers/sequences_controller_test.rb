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
    get :search, q: 'AALER', il_s: 'equateIL'
    assert_redirected_to sequences_path + '/AALER/equateIL'
  end

  test 'should redirect to search without il' do
    get :search, q: 'AALER'
    assert_redirected_to sequences_path + '/AALER/'
  end

  test 'should get show with id' do
    sequence = sequences(:sequence4)
    taxon1 = taxons(:taxon1)
    taxon2 = taxons(:taxon2)
    get :show, id: 4
    assert_response :success
    assert_template :show
    assert_equal sequence.sequence, assigns(:original_sequence)
    assert_equal "Tryptic peptide analysis of #{sequence.sequence}", assigns(:title)
    assert_equal sequence.original_peptides.map(&:uniprot_entry), assigns(:entries)
    assert_equal sequence.original_peptides.map(&:uniprot_entry).map(&:lineage), assigns(:lineages).to_a
    assert_equal sequence.lca_t, assigns(:lca_taxon)
    assert_not_nil assigns(:root)
    assert assigns(:root).start_with? '{'
    assert assigns(:root).end_with? '}'
    assert_equal [taxon2, taxon1], assigns(:common_lineage)
    assert_equal [[taxon2, nil], [taxon2, taxon1]], assigns(:table_lineages)
    assert_equal %w(Organism kingdom species), assigns(:table_ranks)
  end

  test 'should get show with peptide' do
    sequence = sequences(:sequence4)
    taxon1 = taxons(:taxon1)
    taxon2 = taxons(:taxon2)
    get :show, id: 'AAILER'
    assert_response :success
    assert_template :show
    assert_equal sequence.sequence, assigns(:original_sequence)
    assert_equal "Tryptic peptide analysis of #{sequence.sequence}", assigns(:title)
    assert_equal sequence.original_peptides.map(&:uniprot_entry), assigns(:entries)
    assert_equal sequence.original_peptides.map(&:uniprot_entry).map(&:lineage), assigns(:lineages).to_a
    assert_equal sequence.lca_t, assigns(:lca_taxon)
    assert_not_nil assigns(:root)
    assert assigns(:root).start_with? '{'
    assert assigns(:root).end_with? '}'
    assert_equal [taxon2, taxon1], assigns(:common_lineage)
    assert_equal [[taxon2, nil], [taxon2, taxon1]], assigns(:table_lineages)
    assert_equal %w(Organism kingdom species), assigns(:table_ranks)
  end

  test 'should get show with distinct lineage' do
    get :show, id: 7
    assert_response :success
    assert_template :show
  end

  test 'should get show with lowercase peptide' do
    sequence = sequences(:sequence4)
    taxon1 = taxons(:taxon1)
    taxon2 = taxons(:taxon2)
    get :show, id: 'aailer'
    assert_response :success
    assert_template :show
    assert_equal sequence.sequence, assigns(:original_sequence)
    assert_equal "Tryptic peptide analysis of #{sequence.sequence}", assigns(:title)
    assert_equal sequence.original_peptides.map(&:uniprot_entry), assigns(:entries)
    assert_equal sequence.original_peptides.map(&:uniprot_entry).map(&:lineage), assigns(:lineages).to_a
    assert_equal sequence.lca_t, assigns(:lca_taxon)
    assert_not_nil assigns(:root)
    assert assigns(:root).start_with? '{'
    assert assigns(:root).end_with? '}'
    assert_equal [taxon2, taxon1], assigns(:common_lineage)
    assert_equal [[taxon2, nil], [taxon2, taxon1]], assigns(:table_lineages)
    assert_equal %w(Organism kingdom species), assigns(:table_ranks)
  end

  test 'should get show with id and il' do
    sequence = sequences(:sequence5)
    taxon1 = taxons(:taxon1)
    taxon2 = taxons(:taxon2)
    get :show, id: 5, equate_il: 'equateIL'
    assert_response :success
    assert_template :show
    assert_equal sequence.sequence, assigns(:original_sequence)
    assert_equal "Tryptic peptide analysis of #{sequence.sequence}", assigns(:title)
    assert_equal sequence.peptides.map(&:uniprot_entry), assigns(:entries)
    assert_equal sequence.peptides.map(&:uniprot_entry).map(&:lineage), assigns(:lineages).to_a
    assert_equal sequence.lca_il_t, assigns(:lca_taxon)
    assert_not_nil assigns(:root)
    assert assigns(:root).start_with? '{'
    assert assigns(:root).end_with? '}'
    assert_equal [taxon2, taxon1], assigns(:common_lineage)
    assert_equal [[taxon2, nil], [taxon2, taxon1]], assigns(:table_lineages)
    assert_equal %w(Organism kingdom species), assigns(:table_ranks)
  end

  test 'should get show with peptide and il' do
    sequence = sequences(:sequence5)
    taxon1 = taxons(:taxon1)
    taxon2 = taxons(:taxon2)
    get :show, id: 'AAILER', equate_il: 'equateIL'
    assert_response :success
    assert_template :show
    assert_equal @request.parameters[:id], assigns(:original_sequence)
    assert_equal "Tryptic peptide analysis of #{@request.parameters[:id]}", assigns(:title)
    assert_equal sequence.peptides.map(&:uniprot_entry), assigns(:entries)
    assert_equal sequence.peptides.map(&:uniprot_entry).map(&:lineage), assigns(:lineages).to_a
    assert_equal sequence.lca_il_t, assigns(:lca_taxon)
    assert_not_nil assigns(:root)
    assert assigns(:root).start_with? '{'
    assert assigns(:root).end_with? '}'
    assert_equal [taxon2, taxon1], assigns(:common_lineage)
    assert_equal [[taxon2, nil], [taxon2, taxon1]], assigns(:table_lineages)
    assert_equal %w(Organism kingdom species), assigns(:table_ranks)
  end

  test 'should get show with misscleavage and partial peptide' do
    sequence = sequences(:sequence5)
    taxon1 = taxons(:taxon1)
    taxon2 = taxons(:taxon2)
    get :show, id: 'AAILERA'
    assert_response :success
    assert_template :show
    assert_equal @request.parameters[:id], assigns(:original_sequence)
    assert_equal "Tryptic peptide analysis of #{@request.parameters[:id]}", assigns(:title)
    assert_equal sequence.peptides.map(&:uniprot_entry), assigns(:entries)
    assert_equal sequence.peptides.map(&:uniprot_entry).map(&:lineage), assigns(:lineages).to_a
    assert_equal sequence.lca_il_t, assigns(:lca_taxon)
    assert_not_nil assigns(:root)
    assert assigns(:root).start_with? '{'
    assert assigns(:root).end_with? '}'
    assert_equal [taxon2, taxon1], assigns(:common_lineage)
    assert_equal [[taxon2, nil], [taxon2, taxon1]], assigns(:table_lineages)
    assert_equal %w(Organism kingdom species), assigns(:table_ranks)
  end

  test 'should get show with misscleavage and 2 peptides' do
    sequence = sequences(:sequence5)
    sequence6 = sequences(:sequence6)
    taxon2 = taxons(:taxon2)
    get :show, id: 'AAILERAGGAR'
    assert_response :success
    assert_template :show
    assert_equal @request.parameters[:id], assigns(:original_sequence)
    assert_equal "Tryptic peptide analysis of #{@request.parameters[:id]}", assigns(:title)
    assert_equal sequence.peptides.map(&:uniprot_entry) & sequence6.peptides.map(&:uniprot_entry), assigns(:entries)
    assert_equal((sequence.peptides.map(&:uniprot_entry) & sequence6.peptides.map(&:uniprot_entry)).map(&:lineage), assigns(:lineages).to_a)
    assert_equal taxon2, assigns(:lca_taxon)
    assert_not_nil assigns(:root)
    assert assigns(:root).start_with? '{'
    assert assigns(:root).end_with? '}'
    assert_equal [taxon2], assigns(:common_lineage)
    assert_equal [[taxon2]], assigns(:table_lineages)
    assert_equal %w(Organism kingdom), assigns(:table_ranks)
  end

  test 'show should error when id not found' do
    get :show, id: -1
    assert_equal 'The sequence you searched for is too short.', flash[:error]
    assert_redirected_to search_single_url
  end

  test 'show should error when peptide not found' do
    get :show, id: 'LSKDLSQDFLSQDFS'
    assert flash[:error].start_with? 'No matches for peptide'
    assert_redirected_to search_single_url
  end

  test 'show should error when peptide too short' do
    get :show, id: 'AA'
    assert_equal 'The sequence you searched for is too short.', flash[:error]
    assert_redirected_to search_single_url
  end

  test 'should get multi_search' do
    post :multi_search, qs: "AALER\nAALER\nAAILER\nMISSES", search_name: ''
    assert_response :success
    assert_template :multi_search
    assert_equal 'Metaproteomics analysis result', assigns(:title)
    assert_equal @request.parameters, assigns(:p)
    assert_not assigns(:equate_il)
    assert_equal 3, assigns(:number_found)
    assert assigns(:json_missed).include?('MISSES')
    assert_nil assigns(:prideURL)
    assert_not assigns(:intro_text).include?('deduplicated')
    assert_not assigns(:intro_text).include?('equated')
    assert_not assigns(:intro_text).include?('missed cleavage handling')
    assert_not_nil assigns(:json_tree)
    assert_not_nil assigns(:json_sequences)
    assert assigns(:json_sequences).include?('AALER')
    assert assigns(:json_sequences).include?('AAILER')
  end

  test 'should get multi_search with il' do
    post :multi_search, qs: "AALER\nAAILER\nMISSES", search_name: '', il: 1
    assert_response :success
    assert_template :multi_search
    assert_equal 'Metaproteomics analysis result', assigns(:title)
    assert_equal @request.parameters, assigns(:p)
    assert assigns(:equate_il)
    assert_equal 2, assigns(:number_found)
    assert assigns(:json_missed).include?('MISSES')
    assert_nil assigns(:prideURL)
    assert_not assigns(:intro_text).include?('deduplicated')
    assert assigns(:intro_text).include?('equated')
    assert assigns(:intro_text).include?('missed cleavage handling')
    assert_not_nil assigns(:json_tree)
    assert_not_nil assigns(:json_sequences)
    assert assigns(:json_sequences).include?('AALER')
    assert assigns(:json_sequences).include?('AAILER')
  end

  test 'should get multi_search with dupes' do
    post :multi_search, qs: "AALER\nAALER\nAAILER\nMISSES", search_name: '', dupes: 1
    assert_response :success
    assert_template :multi_search
    assert_equal 'Metaproteomics analysis result', assigns(:title)
    assert_equal @request.parameters, assigns(:p)
    assert_not assigns(:equate_il)
    assert_equal 2, assigns(:number_found)
    assert assigns(:json_missed).include?('MISSES')
    assert_nil assigns(:prideURL)
    assert assigns(:intro_text).include?('deduplicated')
    assert_not assigns(:intro_text).include?('equated')
    assert assigns(:intro_text).include?('missed cleavage handling')
    assert_not_nil assigns(:json_tree)
    assert_not_nil assigns(:json_sequences)
    assert assigns(:json_sequences).include?('AALER')
    assert assigns(:json_sequences).include?('AAILER')
  end

  test 'should get multi_search without advanced' do
    post :multi_search, qs: 'AAILERAGGAR', search_name: ''
    assert_response :success
    assert_template :multi_search
    assert_equal 'Metaproteomics analysis result', assigns(:title)
    assert_equal @request.parameters, assigns(:p)
    assert_not assigns(:equate_il)
    assert_equal 2, assigns(:number_found)
    assert_equal '[]', assigns(:json_missed)
    assert_nil assigns(:prideURL)
    assert_not assigns(:intro_text).include?('deduplicated')
    assert_not assigns(:intro_text).include?('equated')
    assert_not assigns(:intro_text).include?('missed cleavage handling')
    assert_not_nil assigns(:json_tree)
    assert_not_nil assigns(:json_sequences)
    assert assigns(:json_sequences).include?('AAILER')
    assert assigns(:json_sequences).include?('AGGAR')
  end

  test 'should get multi_search with advanced' do
    post :multi_search, qs: 'AAILERAGGAR', search_name: '', missed: 1
    assert_response :success
    assert_template :multi_search
    assert_equal 'Metaproteomics analysis result', assigns(:title)
    assert_equal @request.parameters, assigns(:p)
    assert_not assigns(:equate_il)
    assert_equal 1, assigns(:number_found)
    assert_equal '[]', assigns(:json_missed)
    assert_nil assigns(:prideURL)
    assert_not assigns(:intro_text).include?('deduplicated')
    assert_not assigns(:intro_text).include?('equated')
    assert_not assigns(:intro_text).include?('missed cleavage handling')
    assert_not_nil assigns(:json_tree)
    assert_not_nil assigns(:json_sequences)
    assert assigns(:json_sequences).include?('AAILERAGGAR')
  end

  test 'multi_search should return csv with export' do
    post :multi_search, qs: "AALER\nAALER\nAAILER\nMISSES", search_name: 'exp', export: 1, nonce: 'nonce01'
    assert_response :success
    assert_equal 'nonce01', @response.cookies['nonce']
    assert_equal 'attachment; filename=exp.csv', @response.headers['Content-Disposition']
    assert @response.body.include?('AALER')
    assert @response.body.include?('AAILER')
    assert_not @response.body.include?('MISSES')
  end

  test 'multi_search should return csv with export and IL' do
    post :multi_search, qs: "AALER\nAALER\nAAILER\nMISSES", search_name: 'exp', il: 1, export: 1, nonce: 'nonce01'
    assert_response :success
    assert_equal 'nonce01', @response.cookies['nonce']
    assert_equal 'attachment; filename=exp.csv', @response.headers['Content-Disposition']
    assert @response.body.include?('AALER')
    assert @response.body.include?('AAILER')
    assert_not @response.body.include?('MISSES')
  end

  test 'multi_search should return csv with export and advanced' do
    post :multi_search, qs: 'AAILERAGGAR', search_name: 'exp', missed: 1, export: 1, nonce: 'nonce01'
    assert_response :success
    assert_equal 'nonce01', @response.cookies['nonce']
    assert_equal 'attachment; filename=exp.csv', @response.headers['Content-Disposition']
    assert @response.body.include?('AAILERAGGAR')
  end

  test 'multi_search should return csv with export and without advanced' do
    post :multi_search, qs: 'AAILERAGGAR', search_name: 'exp', export: 1, nonce: 'nonce01'
    assert_response :success
    assert_equal 'nonce01', @response.cookies['nonce']
    assert_equal 'attachment; filename=exp.csv', @response.headers['Content-Disposition']
    assert @response.body.include?('AGGAR')
    assert @response.body.include?('AAILER')
    assert_not @response.body.include?('AAILERAGGAR')
  end

  test 'multi_search should add pride url is data comes from pride' do
    post :multi_search, qs: 'AALER', search_name: 'PRIDE assay 123456'
    assert_response :success
    assert_template :multi_search
    assert assigns(:prideURL).include?('123456')
    assert_equal 'Metaproteomics analysis result of PRIDE assay 123456', assigns(:title)
  end

  test 'multi_search should include name in title' do
    post :multi_search, qs: "AALER\nAAILER\nMISSES", search_name: 'title'
    assert_response :success
    assert_template :multi_search
    assert_equal 'Metaproteomics analysis result of title', assigns(:title)
  end

  test 'multi_search should error when input is empty' do
    post :multi_search, qs: '', search_name: ''
    assert_equal 'Your query was empty, please try again.', flash[:error]
    assert_redirected_to datasets_path
  end

  test 'multi_search should error when input is missing' do
    post :multi_search
    assert_equal 'Your query was empty, please try again.', flash[:error]
    assert_redirected_to datasets_path
  end
end
