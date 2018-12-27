require 'test_helper'

class Api::ApiControllerTest < ActionController::TestCase
  test 'set_params should parse single peptide input correctly' do
    get :pept2prot, params: { input: 'AAIER', format: 'json' }
    assert_equal ['AAIER'], assigns(:input)
    assert_not assigns(:equate_il)
    assert_not assigns(:extra_info)
    assert_not assigns(:names)
  end

  test 'set_params should parse hash input correctly' do
    get :pept2prot, params: { input: { 0 => 'AAIER' }, format: 'json' }
    assert_equal ['AAIER'], assigns(:input)
  end

  test 'set_params should parse array input correctly' do
    get :pept2prot, params: { input: %w[AAIER TEST], format: 'json' }
    assert_equal %w[AAIER TEST], assigns(:input)
  end

  test 'set_params should parse json input correctly' do
    get :pept2prot, params: { input: '["AAIER", "TEST"]', format: 'json' }
    assert_equal %w[AAIER TEST], assigns(:input)
  end

  test 'set_params should parse boolean options correctly' do
    get :pept2prot, params: { input: 'AAIER', format: 'json', equate_il: 'true', extra: 'true', names: 'true' }
    assert_equal ['AALER'], assigns(:input)
    assert_equal ['AAIER'], assigns(:input_order)
    assert assigns(:equate_il)
    assert assigns(:extra_info)
    assert assigns(:names)
  end

  test 'should get messages for old version' do
    get :messages, params: { version: '0' }
    assert_response :success
    assert @response.body.present?
  end

  test 'should not get message for current version' do
    get :messages, params: { version: Rails.application.config.versions[:gem] }
    assert_response :success
    assert @response.body.blank?
  end

  test 'should get pept2prot' do
    get :pept2prot, params: { input: %w[AAIER AAILER], format: 'json' }
    assert_response :success
    assert_equal '*', @response.headers['Access-Control-Allow-Origin']
    assert @response.body.include? 'AAIER'
    assert @response.body.include? 'AAILER'
    assert_not @response.body.include? 'AALLER'
    assert_not @response.body.include? 'AALER'
    assert @response.body.include? 'uniprot_id'
    assert @response.body.include? 'protein_name'
    assert @response.body.include? 'taxon_id'
    assert_not @response.body.include? 'taxon_name'
    assert_not @response.body.include? '"uniprot_id":"nr2"'
  end

  test 'should get pept2prot with il' do
    get :pept2prot, params: { input: %w[AAIER AAILER], format: 'json', equate_il: 'true' }
    assert_response :success
    assert_equal '*', @response.headers['Access-Control-Allow-Origin']
    assert @response.body.include? 'AAIER'
    assert @response.body.include? 'AAILER'
    assert_not @response.body.include? 'AALLER'
    assert_not @response.body.include? 'AALER'
    assert @response.body.include? 'uniprot_id'
    assert @response.body.include? 'protein_name'
    assert @response.body.include? 'taxon_id'
    assert_not @response.body.include? 'taxon_name'
    assert @response.body.include? '"uniprot_id":"nr2"'
  end

  test 'should get pept2prot with extra' do
    get :pept2prot, params: { input: %w[AAIER AAILER], format: 'json', extra: 'true' }
    assert_response :success
    assert_equal '*', @response.headers['Access-Control-Allow-Origin']
    assert @response.body.include? 'AAIER'
    assert @response.body.include? 'AAILER'
    assert_not @response.body.include? 'AALLER'
    assert_not @response.body.include? 'AALER'
    assert @response.body.include? 'uniprot_id'
    assert @response.body.include? 'protein_name'
    assert @response.body.include? 'taxon_id'
    assert @response.body.include? 'taxon_name'
    assert_not @response.body.include? '"taxon_name":null'
    assert @response.body.include? 'ec_references'
    assert @response.body.include? 'go_references'
    assert @response.body.include? 'refseq_ids'
    assert @response.body.include? 'refseq_protein_ids'
    assert @response.body.include? 'insdc_ids'
    assert @response.body.include? 'insdc_protein_ids'
    assert_not @response.body.include? '"uniprot_id":"nr2"'
  end

  test 'should get pept2prot with extra and il' do
    get :pept2prot, params: { input: %w[AAIER AAILER], format: 'json', equate_il: 'true', extra: 'true' }
    assert_response :success
    assert_equal '*', @response.headers['Access-Control-Allow-Origin']
    assert @response.body.include? 'AAIER'
    assert @response.body.include? 'AAILER'
    assert_not @response.body.include? 'AALLER'
    assert_not @response.body.include? 'AALER'
    assert @response.body.include? 'uniprot_id'
    assert @response.body.include? 'protein_name'
    assert @response.body.include? 'taxon_id'
    assert @response.body.include? 'taxon_name'
    assert_not @response.body.include? '"taxon_name":null'
    assert @response.body.include? 'ec_references'
    assert @response.body.include? 'go_references'
    assert @response.body.include? 'refseq_ids'
    assert @response.body.include? 'refseq_protein_ids'
    assert @response.body.include? 'insdc_ids'
    assert @response.body.include? 'insdc_protein_ids'
    assert @response.body.include? '"uniprot_id":"nr2"'
  end

  test 'should get pept2taxa' do
    get :pept2taxa, params: { input: %w[AAIER AAILER], format: 'json' }
    assert_response :success
    assert_equal '*', @response.headers['Access-Control-Allow-Origin']
    assert @response.body.include? 'AAIER'
    assert @response.body.include? 'AAILER'
    assert_not @response.body.include? 'AALLER'
    assert_not @response.body.include? 'AALER'
    assert @response.body.include? 'taxon_id'
    assert @response.body.include? 'taxon_name'
    assert @response.body.include? 'taxon_rank'
    assert_not @response.body.include? 'kingdom_id'
    assert_not @response.body.include? 'kingdom_name'
    assert_not @response.body.include? 'AAIER","taxon_id":2'
  end

  test 'should get pept2taxa with il' do
    get :pept2taxa, params: { input: %w[AAIER AAILER], format: 'json', equate_il: 'true' }
    assert_response :success
    assert_equal '*', @response.headers['Access-Control-Allow-Origin']
    assert @response.body.include? 'AAIER'
    assert @response.body.include? 'AAILER'
    assert_not @response.body.include? 'AALLER'
    assert_not @response.body.include? 'AALER'
    assert @response.body.include? 'taxon_id'
    assert @response.body.include? 'taxon_name'
    assert @response.body.include? 'taxon_rank'
    assert_not @response.body.include? 'kingdom_id'
    assert_not @response.body.include? 'kingdom_name'
    assert @response.body.include? 'AAIER","taxon_id":2'
  end

  test 'should get pept2taxa with extra' do
    get :pept2taxa, params: { input: %w[AAIER AAILER], format: 'json', extra: 'true' }
    assert_response :success
    assert_equal '*', @response.headers['Access-Control-Allow-Origin']
    assert @response.body.include? 'AAIER'
    assert @response.body.include? 'AAILER'
    assert_not @response.body.include? 'AALLER'
    assert_not @response.body.include? 'AALER'
    assert @response.body.include? 'taxon_id'
    assert @response.body.include? 'taxon_name'
    assert @response.body.include? 'taxon_rank'
    assert @response.body.include? 'kingdom_id'
    assert_not @response.body.include? 'kingdom_name'
    assert_not @response.body.include? 'AAIER","taxon_id":2'
  end

  test 'should get pept2taxa with names' do
    get :pept2taxa, params: { input: %w[AAIER AAILER], format: 'json', names: 'true' }
    assert_response :success
    assert_equal '*', @response.headers['Access-Control-Allow-Origin']
    assert @response.body.include? 'AAIER'
    assert @response.body.include? 'AAILER'
    assert_not @response.body.include? 'AALLER'
    assert_not @response.body.include? 'AALER'
    assert @response.body.include? 'taxon_id'
    assert @response.body.include? 'taxon_name'
    assert @response.body.include? 'taxon_rank'
    assert_not @response.body.include? 'kingdom_id'
    assert_not @response.body.include? 'kingdom_name'
    assert_not @response.body.include? 'AAIER","taxon_id":2'
  end

  test 'should get pept2taxa with extra and names' do
    get :pept2taxa, params: { input: %w[AAIER AAILER], format: 'json', extra: 'true', names: 'true' }
    assert_response :success
    assert_equal '*', @response.headers['Access-Control-Allow-Origin']
    assert @response.body.include? 'AAIER'
    assert @response.body.include? 'AAILER'
    assert_not @response.body.include? 'AALLER'
    assert_not @response.body.include? 'AALER'
    assert @response.body.include? 'taxon_id'
    assert @response.body.include? 'taxon_name'
    assert @response.body.include? 'taxon_rank'
    assert @response.body.include? 'kingdom_id'
    assert @response.body.include? 'kingdom_name'
    assert_not @response.body.include? 'AAIER","taxon_id":2'
  end

  test 'should get pept2taxa with extra and names and il' do
    get :pept2taxa, params: { input: %w[AAIER AAILER], format: 'json', equate_il: 'true', extra: 'true', names: 'true' }
    assert_response :success
    assert_equal '*', @response.headers['Access-Control-Allow-Origin']
    assert @response.body.include? 'AAIER'
    assert @response.body.include? 'AAILER'
    assert_not @response.body.include? 'AALLER'
    assert_not @response.body.include? 'AALER'
    assert @response.body.include? 'taxon_id'
    assert @response.body.include? 'taxon_name'
    assert @response.body.include? 'taxon_rank'
    assert @response.body.include? 'kingdom_id'
    assert @response.body.include? 'kingdom_name'
    assert @response.body.include? 'AAIER","taxon_id":2'
  end

  test 'should get pept2lca' do
    get :pept2lca, params: { input: %w[AAIER AAILER], format: 'json' }
    assert_response :success
    assert_equal '*', @response.headers['Access-Control-Allow-Origin']
    assert @response.body.include? 'AAIER'
    assert @response.body.include? 'AAILER'
    assert_not @response.body.include? 'AALLER'
    assert_not @response.body.include? 'AALER'
    assert @response.body.include? 'taxon_id'
    assert @response.body.include? 'taxon_name'
    assert @response.body.include? 'taxon_rank'
    assert_not @response.body.include? 'kingdom_id'
    assert_not @response.body.include? 'kingdom_name'
    assert @response.body.include? 'AAIER","taxon_id":2'
  end

  test 'should get pept2lca with il' do
    get :pept2lca, params: { input: %w[AAIER AAILER], format: 'json', equate_il: 'true' }
    assert_response :success
    assert_equal '*', @response.headers['Access-Control-Allow-Origin']
    assert @response.body.include? 'AAIER'
    assert @response.body.include? 'AAILER'
    assert_not @response.body.include? 'AALLER'
    assert_not @response.body.include? 'AALER'
    assert @response.body.include? 'taxon_id'
    assert @response.body.include? 'taxon_name'
    assert @response.body.include? 'taxon_rank'
    assert_not @response.body.include? 'kingdom_id'
    assert_not @response.body.include? 'kingdom_name'
    assert @response.body.include? 'AAIER","taxon_id":1'
  end

  test 'should get pept2lca with extra' do
    get :pept2lca, params: { input: %w[AAIER AAILER], format: 'json', extra: 'true' }
    assert_response :success
    assert_equal '*', @response.headers['Access-Control-Allow-Origin']
    assert @response.body.include? 'AAIER'
    assert @response.body.include? 'AAILER'
    assert_not @response.body.include? 'AALLER'
    assert_not @response.body.include? 'AALER'
    assert @response.body.include? 'taxon_id'
    assert @response.body.include? 'taxon_name'
    assert @response.body.include? 'taxon_rank'
    assert @response.body.include? 'kingdom_id'
    assert_not @response.body.include? 'kingdom_name'
    assert @response.body.include? 'AAIER","taxon_id":2'
  end

  test 'should get pept2lca with names' do
    get :pept2lca, params: { input: %w[AAIER AAILER], format: 'json', names: 'true' }
    assert_response :success
    assert_equal '*', @response.headers['Access-Control-Allow-Origin']
    assert @response.body.include? 'AAIER'
    assert @response.body.include? 'AAILER'
    assert_not @response.body.include? 'AALLER'
    assert_not @response.body.include? 'AALER'
    assert @response.body.include? 'taxon_id'
    assert @response.body.include? 'taxon_name'
    assert @response.body.include? 'taxon_rank'
    assert_not @response.body.include? 'kingdom_id'
    assert_not @response.body.include? 'kingdom_name'
    assert @response.body.include? 'AAIER","taxon_id":2'
  end

  test 'should get pept2lca with extra and names' do
    get :pept2lca, params: { input: %w[AAIER AAILER], format: 'json', extra: 'true', names: 'true' }
    assert_response :success
    assert_equal '*', @response.headers['Access-Control-Allow-Origin']
    assert @response.body.include? 'AAIER'
    assert @response.body.include? 'AAILER'
    assert_not @response.body.include? 'AALLER'
    assert_not @response.body.include? 'AALER'
    assert @response.body.include? 'taxon_id'
    assert @response.body.include? 'taxon_name'
    assert @response.body.include? 'taxon_rank'
    assert @response.body.include? 'kingdom_id'
    assert @response.body.include? 'kingdom_name'
    assert @response.body.include? 'AAIER","taxon_id":2'
  end

  test 'should get pept2lca with extra and names and il' do
    get :pept2lca, params: { input: %w[AAIER AAILER], format: 'json', equate_il: 'true', extra: 'true', names: 'true' }
    assert_response :success
    assert_equal '*', @response.headers['Access-Control-Allow-Origin']
    assert @response.body.include? 'AAIER'
    assert @response.body.include? 'AAILER'
    assert_not @response.body.include? 'AALLER'
    assert_not @response.body.include? 'AALER'
    assert @response.body.include? 'taxon_id'
    assert @response.body.include? 'taxon_name'
    assert @response.body.include? 'taxon_rank'
    assert @response.body.include? 'kingdom_id'
    assert @response.body.include? 'kingdom_name'
    assert @response.body.include? 'AAIER","taxon_id":1'
  end

  test 'should get taxa2lca' do
    get :taxa2lca, params: { input: %w[3 2], format: 'json' }
    assert_response :success
    assert_equal '*', @response.headers['Access-Control-Allow-Origin']
    assert @response.body.include? 'taxon_id'
    assert @response.body.include? 'taxon_name'
    assert @response.body.include? 'taxon_rank'
    assert_not @response.body.include? 'kingdom_id'
    assert_not @response.body.include? 'kingdom_name'
  end

  test 'should get taxa2lca with root' do
    get :taxa2lca, params: { input: %w[1 2], format: 'json' }
    assert_response :success
    assert_equal '*', @response.headers['Access-Control-Allow-Origin']
    assert @response.body.include? 'taxon_id'
    assert @response.body.include? 'taxon_name'
    assert @response.body.include? 'taxon_rank'
    assert_not @response.body.include? 'kingdom_id'
    assert_not @response.body.include? 'kingdom_name'
  end

  test 'should get taxa2lca with extra' do
    get :taxa2lca, params: { input: %w[1 2], format: 'json', extra: 'true' }
    assert_response :success
    assert_equal '*', @response.headers['Access-Control-Allow-Origin']
    assert @response.body.include? 'taxon_id'
    assert @response.body.include? 'taxon_name'
    assert @response.body.include? 'taxon_rank'
    assert @response.body.include? 'kingdom_id'
    assert_not @response.body.include? 'kingdom_name'
  end

  test 'should get taxa2lca with names' do
    get :taxa2lca, params: { input: %w[1 2], format: 'json', names: 'true' }
    assert_response :success
    assert_equal '*', @response.headers['Access-Control-Allow-Origin']
    assert @response.body.include? 'taxon_id'
    assert @response.body.include? 'taxon_name'
    assert @response.body.include? 'taxon_rank'
    assert_not @response.body.include? 'kingdom_id'
    assert_not @response.body.include? 'kingdom_name'
  end

  test 'should get taxa2lca with extra and names' do
    get :taxa2lca, params: { input: %w[1 2], format: 'json', names: 'true', extra: 'true' }
    assert_response :success
    assert_equal '*', @response.headers['Access-Control-Allow-Origin']
    assert @response.body.include? 'taxon_id'
    assert @response.body.include? 'taxon_name'
    assert @response.body.include? 'taxon_rank'
    assert @response.body.include? 'kingdom_id'
    assert @response.body.include? 'kingdom_name'
  end

  test 'should get taxonomy' do
    get :taxonomy, params: { input: %w[1 2], format: 'json' }
    assert_response :success
    assert_equal '*', @response.headers['Access-Control-Allow-Origin']
    assert @response.body.include? 'taxon_id'
    assert @response.body.include? 'taxon_name'
    assert @response.body.include? 'taxon_rank'
    assert_not @response.body.include? 'kingdom_id'
    assert_not @response.body.include? 'kingdom_name'
  end

  test 'should get taxonomy with extra' do
    get :taxonomy, params: { input: %w[1 2], format: 'json', extra: 'true' }
    assert_response :success
    assert_equal '*', @response.headers['Access-Control-Allow-Origin']
    assert @response.body.include? 'taxon_id'
    assert @response.body.include? 'taxon_name'
    assert @response.body.include? 'taxon_rank'
    assert @response.body.include? 'kingdom_id'
    assert_not @response.body.include? 'kingdom_name'
  end

  test 'should get taxonomy with names' do
    get :taxonomy, params: { input: %w[1 2], format: 'json', names: 'true' }
    assert_response :success
    assert_equal '*', @response.headers['Access-Control-Allow-Origin']
    assert @response.body.include? 'taxon_id'
    assert @response.body.include? 'taxon_name'
    assert @response.body.include? 'taxon_rank'
    assert_not @response.body.include? 'kingdom_id'
    assert_not @response.body.include? 'kingdom_name'
  end

  test 'should get taxonomy with extra and names' do
    get :taxonomy, params: { input: %w[1 2], format: 'json', names: 'true', extra: 'true' }
    assert_response :success
    assert_equal '*', @response.headers['Access-Control-Allow-Origin']
    assert @response.body.include? 'taxon_id'
    assert @response.body.include? 'taxon_name'
    assert @response.body.include? 'taxon_rank'
    assert @response.body.include? 'kingdom_id'
    assert @response.body.include? 'kingdom_name'
  end

  test "shouldn't crash when logging to stathat" do
    Rails.application.config.unipept_API_logging = true
    Rails.application.config.unipept_stathat_key = 'key'
    get :taxonomy, params: { input: %w[1 2], format: 'json' }
    assert_response :success
    Rails.application.config.unipept_API_logging = false
  end

  test 'should get pept2ec' do
    get :pept2ec, params: { input: %w[AAIER AAILER], format: 'json' }
    assert_response :success
    assert_equal '*', @response.headers['Access-Control-Allow-Origin']
    assert @response.body.include? 'AAIER'
    assert @response.body.include? 'AAILER'
    assert_not @response.body.include? 'AALLER'
    assert_not @response.body.include? 'AALER'
    assert @response.body.include? 'peptide'
    assert @response.body.include? 'total_protein_count'
    assert @response.body.include? 'ec'
    assert @response.body.include? 'ec_number'
    assert @response.body.include? 'protein_count'
    assert_not @response.body.include? 'name'
  end

  test 'should get pept2ec with il' do
    get :pept2ec, params: { input: %w[AAIER AAILER], format: 'json', equate_il: 'true' }
    assert_response :success
    assert_equal '*', @response.headers['Access-Control-Allow-Origin']
    assert @response.body.include? 'AAIER'
    assert @response.body.include? 'AAILER'
    assert_not @response.body.include? 'AALLER'
    assert_not @response.body.include? 'AALER'
    assert @response.body.include? 'peptide'
    assert @response.body.include? 'total_protein_count'
    assert @response.body.include? 'ec'
    assert @response.body.include? 'ec_number'
    assert @response.body.include? 'protein_count'
    assert_not @response.body.include? 'name'
  end

  test 'should get pept2ec with extra' do
    get :pept2ec, params: { input: %w[AAIER AAILER], format: 'json', extra: 'true' }
    assert_response :success
    assert_equal '*', @response.headers['Access-Control-Allow-Origin']
    assert @response.body.include? 'AAIER'
    assert @response.body.include? 'AAILER'
    assert_not @response.body.include? 'AALLER'
    assert_not @response.body.include? 'AALER'
    assert @response.body.include? 'peptide'
    assert @response.body.include? 'total_protein_count'
    assert @response.body.include? 'ec'
    assert @response.body.include? 'ec_number'
    assert @response.body.include? 'protein_count'
    assert @response.body.include? 'name'
  end

  test 'should get pept2go' do
    get :pept2go, params: { input: %w[AAIER AAILER], format: 'json' }
    assert_response :success
    assert_equal '*', @response.headers['Access-Control-Allow-Origin']
    assert @response.body.include? 'AAIER'
    assert @response.body.include? 'AAILER'
    assert_not @response.body.include? 'AALLER'
    assert_not @response.body.include? 'AALER'
    assert @response.body.include? 'peptide'
    assert @response.body.include? 'total_protein_count'
    assert @response.body.include? 'go'
    assert @response.body.include? 'go_term'
    assert @response.body.include? 'protein_count'
    assert_not @response.body.include? 'name'
    assert_not @response.body.include? 'molecular function'
    assert_not @response.body.include? 'biological process'
    assert_not @response.body.include? 'cellular component'
  end

  test 'should get pept2go with il' do
    get :pept2go, params: { input: %w[AAIER AAILER], format: 'json', equate_il: 'true' }
    assert_response :success
    assert_equal '*', @response.headers['Access-Control-Allow-Origin']
    assert @response.body.include? 'AAIER'
    assert @response.body.include? 'AAILER'
    assert_not @response.body.include? 'AALLER'
    assert_not @response.body.include? 'AALER'
    assert @response.body.include? 'peptide'
    assert @response.body.include? 'total_protein_count'
    assert @response.body.include? 'go'
    assert @response.body.include? 'go_term'
    assert @response.body.include? 'protein_count'
    assert_not @response.body.include? 'name'
    assert_not @response.body.include? 'molecular function'
    assert_not @response.body.include? 'biological process'
    assert_not @response.body.include? 'cellular component'
  end

  test 'should get pept2go with extra' do
    get :pept2go, params: { input: %w[AAIER AAILER], format: 'json', extra: 'true' }
    assert_response :success
    assert_equal '*', @response.headers['Access-Control-Allow-Origin']
    assert @response.body.include? 'AAIER'
    assert @response.body.include? 'AAILER'
    assert_not @response.body.include? 'AALLER'
    assert_not @response.body.include? 'AALER'
    assert @response.body.include? 'peptide'
    assert @response.body.include? 'total_protein_count'
    assert @response.body.include? 'go'
    assert @response.body.include? 'go_term'
    assert @response.body.include? 'protein_count'
    assert @response.body.include? 'name'
    assert_not @response.body.include? 'molecular function'
    assert_not @response.body.include? 'biological process'
    assert_not @response.body.include? 'cellular component'
  end

  test 'should get pept2go with domains' do
    get :pept2go, params: { input: %w[AAIER AAILER], format: 'json', domains: 'true' }
    assert_response :success
    assert_equal '*', @response.headers['Access-Control-Allow-Origin']
    assert @response.body.include? 'AAIER'
    assert @response.body.include? 'AAILER'
    assert_not @response.body.include? 'AALLER'
    assert_not @response.body.include? 'AALER'
    assert @response.body.include? 'peptide'
    assert @response.body.include? 'total_protein_count'
    assert @response.body.include? 'go'
    assert @response.body.include? 'go_term'
    assert @response.body.include? 'protein_count'
    assert_not @response.body.include? 'name'
    assert @response.body.include? 'molecular function'
    assert @response.body.include? 'biological process'
    assert @response.body.include? 'cellular component'
  end

  test 'should get pept2go with extra and domains' do
    get :pept2go, params: { input: %w[AAIER AAILER], format: 'json', extra: 'true', domains: 'true' }
    assert_response :success
    assert_equal '*', @response.headers['Access-Control-Allow-Origin']
    assert @response.body.include? 'AAIER'
    assert @response.body.include? 'AAILER'
    assert_not @response.body.include? 'AALLER'
    assert_not @response.body.include? 'AALER'
    assert @response.body.include? 'peptide'
    assert @response.body.include? 'total_protein_count'
    assert @response.body.include? 'go'
    assert @response.body.include? 'go_term'
    assert @response.body.include? 'protein_count'
    assert @response.body.include? 'name'
    assert @response.body.include? 'molecular function'
    assert @response.body.include? 'biological process'
    assert @response.body.include? 'cellular component'
  end

  test 'should get pept2funct' do
    get :pept2funct, params: { input: %w[AAIER AAILER], format: 'json' }
    assert_response :success
    assert_equal '*', @response.headers['Access-Control-Allow-Origin']
    assert @response.body.include? 'AAIER'
    assert @response.body.include? 'AAILER'
    assert_not @response.body.include? 'AALLER'
    assert_not @response.body.include? 'AALER'
    assert @response.body.include? 'peptide'
    assert @response.body.include? 'total_protein_count'
    assert @response.body.include? 'go'
    assert @response.body.include? 'go_term'
    assert @response.body.include? 'protein_count'
    assert @response.body.include? 'ec'
    assert @response.body.include? 'ec_number'
    assert_not @response.body.include? 'name'
    assert_not @response.body.include? 'molecular function'
    assert_not @response.body.include? 'biological process'
    assert_not @response.body.include? 'cellular component'
  end

  test 'should get pept2funct with il' do
    get :pept2funct, params: { input: %w[AAIER AAILER], format: 'json', equate_il: 'true' }
    assert_response :success
    assert_equal '*', @response.headers['Access-Control-Allow-Origin']
    assert @response.body.include? 'AAIER'
    assert @response.body.include? 'AAILER'
    assert_not @response.body.include? 'AALLER'
    assert_not @response.body.include? 'AALER'
    assert @response.body.include? 'peptide'
    assert @response.body.include? 'total_protein_count'
    assert @response.body.include? 'go'
    assert @response.body.include? 'go_term'
    assert @response.body.include? 'protein_count'
    assert @response.body.include? 'ec'
    assert @response.body.include? 'ec_number'
    assert_not @response.body.include? 'name'
    assert_not @response.body.include? 'molecular function'
    assert_not @response.body.include? 'biological process'
    assert_not @response.body.include? 'cellular component'
  end

  test 'should get pept2funct with extra' do
    get :pept2funct, params: { input: %w[AAIER AAILER], format: 'json', extra: 'true' }
    assert_response :success
    assert_equal '*', @response.headers['Access-Control-Allow-Origin']
    assert @response.body.include? 'AAIER'
    assert @response.body.include? 'AAILER'
    assert_not @response.body.include? 'AALLER'
    assert_not @response.body.include? 'AALER'
    assert @response.body.include? 'peptide'
    assert @response.body.include? 'total_protein_count'
    assert @response.body.include? 'go'
    assert @response.body.include? 'go_term'
    assert @response.body.include? 'protein_count'
    assert @response.body.include? 'ec'
    assert @response.body.include? 'ec_number'
    assert @response.body.include? 'name'
    assert_not @response.body.include? 'molecular function'
    assert_not @response.body.include? 'biological process'
    assert_not @response.body.include? 'cellular component'
  end

  test 'should get pept2funct with domains' do
    get :pept2funct, params: { input: %w[AAIER AAILER], format: 'json', domains: 'true' }
    assert_response :success
    assert_equal '*', @response.headers['Access-Control-Allow-Origin']
    assert @response.body.include? 'AAIER'
    assert @response.body.include? 'AAILER'
    assert_not @response.body.include? 'AALLER'
    assert_not @response.body.include? 'AALER'
    assert @response.body.include? 'peptide'
    assert @response.body.include? 'total_protein_count'
    assert @response.body.include? 'go'
    assert @response.body.include? 'go_term'
    assert @response.body.include? 'protein_count'
    assert @response.body.include? 'ec'
    assert @response.body.include? 'ec_number'
    assert_not @response.body.include? 'name'
    assert @response.body.include? 'molecular function'
    assert @response.body.include? 'biological process'
    assert @response.body.include? 'cellular component'
  end

  test 'should get pept2funct with extra and domains' do
    get :pept2funct, params: { input: %w[AAIER AAILER], format: 'json', extra: 'true', domains: 'true' }
    assert_response :success
    assert_equal '*', @response.headers['Access-Control-Allow-Origin']
    assert @response.body.include? 'AAIER'
    assert @response.body.include? 'AAILER'
    assert_not @response.body.include? 'AALLER'
    assert_not @response.body.include? 'AALER'
    assert @response.body.include? 'peptide'
    assert @response.body.include? 'total_protein_count'
    assert @response.body.include? 'go'
    assert @response.body.include? 'go_term'
    assert @response.body.include? 'protein_count'
    assert @response.body.include? 'ec'
    assert @response.body.include? 'ec_number'
    assert @response.body.include? 'name'
    assert @response.body.include? 'molecular function'
    assert @response.body.include? 'biological process'
    assert @response.body.include? 'cellular component'
  end

  test 'should get peptinfo' do
    get :peptinfo, params: { input: %w[AAIER AAILER], format: 'json' }
    assert_response :success
    assert_equal '*', @response.headers['Access-Control-Allow-Origin']
    assert @response.body.include? 'AAIER'
    assert @response.body.include? 'AAILER'
    assert_not @response.body.include? 'AALLER'
    assert_not @response.body.include? 'AALER'
    assert @response.body.include? 'peptide'
    assert @response.body.include? 'total_protein_count'
    assert @response.body.include? 'go'
    assert @response.body.include? 'go_term'
    assert @response.body.include? 'protein_count'
    assert @response.body.include? 'ec'
    assert @response.body.include? 'ec_number'
    assert_not @response.body.include? 'some function 2'
    assert_not @response.body.include? 'molecular function'
    assert_not @response.body.include? 'biological process'
    assert_not @response.body.include? 'cellular component'
    assert @response.body.include? 'taxon_id'
    assert @response.body.include? 'taxon_name'
    assert @response.body.include? 'taxon_rank'
    assert_not @response.body.include? 'kingdom_id'
    assert_not @response.body.include? 'kingdom_name'
  end

  test 'should get peptinfo with il' do
    get :peptinfo, params: { input: %w[AAIER AAILER], format: 'json', equate_il: 'true' }
    assert_response :success
    assert_equal '*', @response.headers['Access-Control-Allow-Origin']
    assert @response.body.include? 'AAIER'
    assert @response.body.include? 'AAILER'
    assert_not @response.body.include? 'AALLER'
    assert_not @response.body.include? 'AALER'
    assert @response.body.include? 'peptide'
    assert @response.body.include? 'total_protein_count'
    assert @response.body.include? 'go'
    assert @response.body.include? 'go_term'
    assert @response.body.include? 'protein_count'
    assert @response.body.include? 'ec'
    assert @response.body.include? 'ec_number'
    assert_not @response.body.include? 'some function 2'
    assert_not @response.body.include? 'molecular function'
    assert_not @response.body.include? 'biological process'
    assert_not @response.body.include? 'cellular component'
    assert @response.body.include? 'taxon_id'
    assert @response.body.include? 'taxon_name'
    assert @response.body.include? 'taxon_rank'
    assert_not @response.body.include? 'kingdom_id'
    assert_not @response.body.include? 'kingdom_name'
  end

  test 'should get peptinfo with extra' do
    get :peptinfo, params: { input: %w[AAIER AAILER], format: 'json', extra: 'true' }
    assert_response :success
    assert_equal '*', @response.headers['Access-Control-Allow-Origin']
    assert @response.body.include? 'AAIER'
    assert @response.body.include? 'AAILER'
    assert_not @response.body.include? 'AALLER'
    assert_not @response.body.include? 'AALER'
    assert @response.body.include? 'peptide'
    assert @response.body.include? 'total_protein_count'
    assert @response.body.include? 'go'
    assert @response.body.include? 'go_term'
    assert @response.body.include? 'protein_count'
    assert @response.body.include? 'ec'
    assert @response.body.include? 'ec_number'
    assert @response.body.include? 'some function 2'
    assert_not @response.body.include? 'molecular function'
    assert_not @response.body.include? 'biological process'
    assert_not @response.body.include? 'cellular component'
    assert @response.body.include? 'taxon_id'
    assert @response.body.include? 'taxon_name'
    assert @response.body.include? 'taxon_rank'
    assert @response.body.include? 'kingdom_id'
    assert_not @response.body.include? 'kingdom_name'
  end

  test 'should get peptinfo with domains' do
    get :peptinfo, params: { input: %w[AAIER AAILER], format: 'json', domains: 'true' }
    assert_response :success
    assert_equal '*', @response.headers['Access-Control-Allow-Origin']
    assert @response.body.include? 'AAIER'
    assert @response.body.include? 'AAILER'
    assert_not @response.body.include? 'AALLER'
    assert_not @response.body.include? 'AALER'
    assert @response.body.include? 'peptide'
    assert @response.body.include? 'total_protein_count'
    assert @response.body.include? 'go'
    assert @response.body.include? 'go_term'
    assert @response.body.include? 'protein_count'
    assert @response.body.include? 'ec'
    assert @response.body.include? 'ec_number'
    assert_not @response.body.include? 'some function 2'
    assert @response.body.include? 'molecular function'
    assert @response.body.include? 'biological process'
    assert @response.body.include? 'cellular component'
    assert @response.body.include? 'taxon_id'
    assert @response.body.include? 'taxon_name'
    assert @response.body.include? 'taxon_rank'
    assert_not @response.body.include? 'kingdom_id'
    assert_not @response.body.include? 'kingdom_name'
  end

  test 'should get peptinfo with extra and domains' do
    get :peptinfo, params: { input: %w[AAIER AAILER], format: 'json', extra: 'true', domains: 'true' }
    assert_response :success
    assert_equal '*', @response.headers['Access-Control-Allow-Origin']
    assert @response.body.include? 'AAIER'
    assert @response.body.include? 'AAILER'
    assert_not @response.body.include? 'AALLER'
    assert_not @response.body.include? 'AALER'
    assert @response.body.include? 'peptide'
    assert @response.body.include? 'total_protein_count'
    assert @response.body.include? 'go'
    assert @response.body.include? 'go_term'
    assert @response.body.include? 'protein_count'
    assert @response.body.include? 'ec'
    assert @response.body.include? 'ec_number'
    assert @response.body.include? 'some function 2'
    assert @response.body.include? 'molecular function'
    assert @response.body.include? 'biological process'
    assert @response.body.include? 'cellular component'
    assert @response.body.include? 'taxon_id'
    assert @response.body.include? 'taxon_name'
    assert @response.body.include? 'taxon_rank'
    assert @response.body.include? 'kingdom_id'
    assert_not @response.body.include? 'kingdom_name'
  end
end
