require 'test_helper'

class PeptidomeControllerTest < ActionController::TestCase
  test 'should get analyze' do
    get :analyze
    assert_response :success
    assert_template :analyze
    assert_equal 'Peptidome Analysis', assigns(:title)
    assert_equal 'peptidefinder', assigns(:tab)
    assert_not_nil assigns(:species)
    assert_not_nil assigns(:genomes)
    assert_not_nil assigns(:taxa)
  end

  test 'should set correct title for analyze peptidefinder' do
    get :analyze, tab: 'peptidefinder'
    assert_response :success
    assert_template :analyze
    assert_equal 'Unique Peptide Finder', assigns(:title)
    assert_equal 'peptidefinder', assigns(:tab)
  end

  test 'should set correct title for analyze peptidomeclustering' do
    get :analyze, tab: 'peptidomeclustering'
    assert_response :success
    assert_template :analyze
    assert_equal 'Peptidome Clustering', assigns(:title)
    assert_equal 'peptidomeclustering', assigns(:tab)
  end

  test 'should get get_sequence_ids_for_bioproject' do
    genome = genome_caches(:genomecache1)
    get :get_sequence_ids_for_bioproject, bioproject_id: '1', format: 'json'
    assert_response :success
    assert_equal genome.json_sequences, @response.body
  end

  test 'should get get_genomes' do
    get :get_genomes, species_id: '1', format: 'json'
    assert_response :success
    assert @response.body.start_with? '[{'
    assert @response.body.end_with? '}]'
  end

  test 'should get get_unique_sequences' do
    get :get_unique_sequences, sequences: '[1, 2, 3]', bioprojects: '1', format: 'json'
    assert_response :success
    assert_equal '["species1",[3]]', @response.body
  end

  test 'should return undefined for get_unique_sequences without bioprojects' do
    get :get_unique_sequences, sequences: '[1, 2, 3]', bioprojects: '', format: 'json'
    assert_response :success
    assert_equal '["undefined",[]]', @response.body
  end

  test 'should get get_sequences' do
    get :get_sequences, sequence_ids: '[1, 2]'
    assert_response :success
    assert_equal '"AALER\nAAIER"', @response.body
  end

  test 'should get convert_peptides' do
    get :convert_peptides, peptides: '["AALER", "AAIER", "FOO"]'
    assert_response :success
    assert_equal '[2,1]', @response.body
  end

  test 'should get get_lca' do
    species = taxons(:taxon1)
    get :get_lca, bioprojects: '1'
    assert_response :success
    assert_equal species.to_json, @response.body
  end

  test 'should return undefined without bioprojects' do
    get :get_lca, bioprojects: ''
    assert_response :success
    assert_equal '{"name":"undefined"}', @response.body
  end
end
