require 'test_helper'

class PeptidomeControllerTest < ActionController::TestCase
  test 'should get analyze' do
    get :analyze
    assert_response :success
    assert_template :analyze
    assert_equal 'Peptidome Analysis', assigns(:title)
    assert_equal 'peptidefinder', assigns(:tab)
    assert_not_nil assigns(:proteomes)
    assert_not_nil assigns(:taxa)
  end

  test 'should set correct title for analyze peptidefinder' do
    get :analyze, params: { tab: 'peptidefinder' }
    assert_response :success
    assert_template :analyze
    assert_equal 'Unique Peptide Finder', assigns(:title)
    assert_equal 'peptidefinder', assigns(:tab)
  end

  test 'should set correct title for analyze peptidomeclustering' do
    get :analyze, params: { tab: 'peptidomeclustering' }
    assert_response :success
    assert_template :analyze
    assert_equal 'Peptidome Clustering', assigns(:title)
    assert_equal 'peptidomeclustering', assigns(:tab)
  end

  test 'should get get_sequence_ids_for_proteome' do
    proteome = proteome_caches(:proteomecache1)
    get :get_sequence_ids_for_proteome, params: { proteome_id: '1', format: 'json' }
    assert_response :success
    assert_equal proteome.json_sequences, @response.body
  end

  test 'should get get_unique_sequences for own sequences' do
    get :get_unique_sequences, params: { sequences: '[1, 1, 1]', ids: '1', format: 'json' }
    assert_response :success
    assert_equal '["species1",[3]]', @response.body
  end

  test 'should get get_unique_sequences for uniprot proteomes' do
    get :get_unique_sequences, params: { proteome_id: '1', ids: '1', format: 'json' }
    assert_response :success
    assert_equal '["species1",[3]]', @response.body
  end

  test 'should return undefined for get_unique_sequences without proteome id' do
    get :get_unique_sequences, params: { sequences: '[1, 2, 3]', ids: '', format: 'json' }
    assert_response :success
    assert_equal '["undefined",[]]', @response.body
  end

  test 'should get get_sequences' do
    get :get_sequences, params: { sequence_ids: '[1, 1]' }
    assert_response :success
    assert_equal '"AALER\nAAIER"', @response.body
  end

  test 'should get get_proteins' do
    get :get_proteins, params: { sequence_ids: '[1, 1]' }
    assert_response :success
    assert_equal '"sequence,lca_taxon_id,uniprot_id,protein_name\nAALER,2,nr2,some name\nAAIER,2,nr,some name\n"', @response.body
  end

  test 'should get convert_peptides' do
    get :convert_peptides, params: { peptides: '["AALER", "AAIER", "FOO"]' }
    assert_response :success
    assert_equal '[2,1]', @response.body
  end

  test 'should get get_lca' do
    species = taxons(:taxon1)
    get :get_lca, params: { ids: '1' }
    assert_response :success
    assert_equal species.to_json, @response.body
  end

  test 'should return undefined without ids' do
    get :get_lca, params: { ids: '' }
    assert_response :success
    assert_equal '{"name":"undefined"}', @response.body
  end
end
