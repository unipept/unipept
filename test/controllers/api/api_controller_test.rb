require 'test_helper'

class Api::ApiControllerTest < ActionController::TestCase

  test "set_params should parse single peptide input correctly" do
    get :pept2prot, input: "AAIER", format: "json"
    assert_equal ["AAIER"], assigns(:input)
    assert_not assigns(:equate_il)
    assert_not assigns(:extra_info)
    assert_not assigns(:names)
  end

  test "set_params should parse hash input correctly" do
    get :pept2prot, input: {0 => "AAIER"}, format: "json"
    assert_equal ["AAIER"], assigns(:input)
  end

  test "set_params should parse array input correctly" do
    get :pept2prot, input: ["AAIER", "TEST"], format: "json"
    assert_equal ["AAIER", "TEST"], assigns(:input)
  end

  test "set_params should parse json input correctly" do
    get :pept2prot, input: '["AAIER", "TEST"]', format: "json"
    assert_equal ["AAIER", "TEST"], assigns(:input)
  end

  test "set_params should parse boolean options correctly" do
    get :pept2prot, input: "AAIER", format: "json", equate_il: "true", extra: "true", names: "true"
    assert_equal ["AALER"], assigns(:input)
    assert_equal ["AAIER"], assigns(:input_order)
    assert assigns(:equate_il)
    assert assigns(:extra_info)
    assert assigns(:names)
  end

  test "should get messages for old version" do
    get :messages, version: "0"
    assert_response :success
    assert @response.body.present?
  end

  test "should not get message for current version" do
    get :messages, version: Rails.application.config.versions[:gem]
    assert_response :success
    assert @response.body.blank?
  end

  test "should get pept2prot" do
    get :pept2prot, input: ["AAIER", "AAILER"], format: "json"
    assert_response :success
    assert_equal "*", @response.headers["Access-Control-Allow-Origin"]
    assert @response.body.include? "AAIER"
    assert @response.body.include? "AAILER"
    assert_not @response.body.include? "AALLER"
    assert_not @response.body.include? "AALER"
    assert @response.body.include? "uniprot_id"
    assert @response.body.include? "taxon_id"
    assert_not @response.body.include? "taxon_name"
    assert_not @response.body.include? '"uniprot_id":"nr2"'
  end

  test "should get pept2prot with il" do
    get :pept2prot, input: ["AAIER", "AAILER"], format: "json", equate_il: "true"
    assert_response :success
    assert_equal "*", @response.headers["Access-Control-Allow-Origin"]
    assert @response.body.include? "AAIER"
    assert @response.body.include? "AAILER"
    assert_not @response.body.include? "AALLER"
    assert_not @response.body.include? "AALER"
    assert @response.body.include? "uniprot_id"
    assert @response.body.include? "taxon_id"
    assert_not @response.body.include? "taxon_name"
    assert @response.body.include? '"uniprot_id":"nr2"'
  end

  test "should get pept2prot with extra" do
    get :pept2prot, input: ["AAIER", "AAILER"], format: "json", extra: "true"
    assert_response :success
    assert_equal "*", @response.headers["Access-Control-Allow-Origin"]
    assert @response.body.include? "AAIER"
    assert @response.body.include? "AAILER"
    assert_not @response.body.include? "AALLER"
    assert_not @response.body.include? "AALER"
    assert @response.body.include? "uniprot_id"
    assert @response.body.include? "taxon_id"
    assert @response.body.include? "taxon_name"
    assert @response.body.include? "ec_references"
    assert @response.body.include? "go_references"
    assert_not @response.body.include? '"uniprot_id":"nr2"'
  end

  test "should get pept2prot with extra and il" do
    get :pept2prot, input: ["AAIER", "AAILER"], format: "json", equate_il: "true", extra: "true"
    assert_response :success
    assert_equal "*", @response.headers["Access-Control-Allow-Origin"]
    assert @response.body.include? "AAIER"
    assert @response.body.include? "AAILER"
    assert_not @response.body.include? "AALLER"
    assert_not @response.body.include? "AALER"
    assert @response.body.include? "uniprot_id"
    assert @response.body.include? "taxon_id"
    assert @response.body.include? "taxon_name"
    assert @response.body.include? "ec_references"
    assert @response.body.include? "go_references"
    assert @response.body.include? '"uniprot_id":"nr2"'
  end


  test "should get pept2taxa" do
    get :pept2taxa, input: ["AAIER", "AAILER"], format: "json"
    assert_response :success
    assert_equal "*", @response.headers["Access-Control-Allow-Origin"]
    assert @response.body.include? "AAIER"
    assert @response.body.include? "AAILER"
    assert_not @response.body.include? "AALLER"
    assert_not @response.body.include? "AALER"
    assert @response.body.include? "taxon_id"
    assert @response.body.include? "taxon_name"
    assert @response.body.include? "taxon_rank"
    assert_not @response.body.include? "kingdom_id"
    assert_not @response.body.include? "kingdom_name"
    assert_not @response.body.include? 'AAIER","taxon_id":2'
  end

  test "should get pept2taxa with il" do
    get :pept2taxa, input: ["AAIER", "AAILER"], format: "json", equate_il: "true"
    assert_response :success
    assert_equal "*", @response.headers["Access-Control-Allow-Origin"]
    assert @response.body.include? "AAIER"
    assert @response.body.include? "AAILER"
    assert_not @response.body.include? "AALLER"
    assert_not @response.body.include? "AALER"
    assert @response.body.include? "taxon_id"
    assert @response.body.include? "taxon_name"
    assert @response.body.include? "taxon_rank"
    assert_not @response.body.include? "kingdom_id"
    assert_not @response.body.include? "kingdom_name"
    assert @response.body.include? 'AAIER","taxon_id":2'
  end

  test "should get pept2taxa with extra" do
    get :pept2taxa, input: ["AAIER", "AAILER"], format: "json", extra: "true"
    assert_response :success
    assert_equal "*", @response.headers["Access-Control-Allow-Origin"]
    assert @response.body.include? "AAIER"
    assert @response.body.include? "AAILER"
    assert_not @response.body.include? "AALLER"
    assert_not @response.body.include? "AALER"
    assert @response.body.include? "taxon_id"
    assert @response.body.include? "taxon_name"
    assert @response.body.include? "taxon_rank"
    assert @response.body.include? "kingdom_id"
    assert_not @response.body.include? "kingdom_name"
    assert_not @response.body.include? 'AAIER","taxon_id":2'
  end

  test "should get pept2taxa with names" do
    get :pept2taxa, input: ["AAIER", "AAILER"], format: "json", names: "true"
    assert_response :success
    assert_equal "*", @response.headers["Access-Control-Allow-Origin"]
    assert @response.body.include? "AAIER"
    assert @response.body.include? "AAILER"
    assert_not @response.body.include? "AALLER"
    assert_not @response.body.include? "AALER"
    assert @response.body.include? "taxon_id"
    assert @response.body.include? "taxon_name"
    assert @response.body.include? "taxon_rank"
    assert_not @response.body.include? "kingdom_id"
    assert_not @response.body.include? "kingdom_name"
    assert_not @response.body.include? 'AAIER","taxon_id":2'
  end

  test "should get pept2taxa with extra and names" do
    get :pept2taxa, input: ["AAIER", "AAILER"], format: "json", extra: "true", names: "true"
    assert_response :success
    assert_equal "*", @response.headers["Access-Control-Allow-Origin"]
    assert @response.body.include? "AAIER"
    assert @response.body.include? "AAILER"
    assert_not @response.body.include? "AALLER"
    assert_not @response.body.include? "AALER"
    assert @response.body.include? "taxon_id"
    assert @response.body.include? "taxon_name"
    assert @response.body.include? "taxon_rank"
    assert @response.body.include? "kingdom_id"
    assert @response.body.include? "kingdom_name"
    assert_not @response.body.include? 'AAIER","taxon_id":2'
  end

  test "should get pept2taxa with extra and names and il" do
    get :pept2taxa, input: ["AAIER", "AAILER"], format: "json", equate_il: "true", extra: "true", names: "true"
    assert_response :success
    assert_equal "*", @response.headers["Access-Control-Allow-Origin"]
    assert @response.body.include? "AAIER"
    assert @response.body.include? "AAILER"
    assert_not @response.body.include? "AALLER"
    assert_not @response.body.include? "AALER"
    assert @response.body.include? "taxon_id"
    assert @response.body.include? "taxon_name"
    assert @response.body.include? "taxon_rank"
    assert @response.body.include? "kingdom_id"
    assert @response.body.include? "kingdom_name"
    assert @response.body.include? 'AAIER","taxon_id":2'
  end


  test "should get pept2lca" do
    get :pept2lca, input: ["AAIER", "AAILER"], format: "json"
    assert_response :success
    assert_equal "*", @response.headers["Access-Control-Allow-Origin"]
    assert @response.body.include? "AAIER"
    assert @response.body.include? "AAILER"
    assert_not @response.body.include? "AALLER"
    assert_not @response.body.include? "AALER"
    assert @response.body.include? "taxon_id"
    assert @response.body.include? "taxon_name"
    assert @response.body.include? "taxon_rank"
    assert_not @response.body.include? "kingdom_id"
    assert_not @response.body.include? "kingdom_name"
    assert @response.body.include? 'AAIER","taxon_id":2'
  end

  test "should get pept2lca with il" do
    get :pept2lca, input: ["AAIER", "AAILER"], format: "json", equate_il: "true"
    assert_response :success
    assert_equal "*", @response.headers["Access-Control-Allow-Origin"]
    assert @response.body.include? "AAIER"
    assert @response.body.include? "AAILER"
    assert_not @response.body.include? "AALLER"
    assert_not @response.body.include? "AALER"
    assert @response.body.include? "taxon_id"
    assert @response.body.include? "taxon_name"
    assert @response.body.include? "taxon_rank"
    assert_not @response.body.include? "kingdom_id"
    assert_not @response.body.include? "kingdom_name"
    assert @response.body.include? 'AAIER","taxon_id":1'
  end

  test "should get pept2lca with extra" do
    get :pept2lca, input: ["AAIER", "AAILER"], format: "json", extra: "true"
    assert_response :success
    assert_equal "*", @response.headers["Access-Control-Allow-Origin"]
    assert @response.body.include? "AAIER"
    assert @response.body.include? "AAILER"
    assert_not @response.body.include? "AALLER"
    assert_not @response.body.include? "AALER"
    assert @response.body.include? "taxon_id"
    assert @response.body.include? "taxon_name"
    assert @response.body.include? "taxon_rank"
    assert @response.body.include? "kingdom_id"
    assert_not @response.body.include? "kingdom_name"
    assert @response.body.include? 'AAIER","taxon_id":2'
  end

  test "should get pept2lca with names" do
    get :pept2lca, input: ["AAIER", "AAILER"], format: "json", names: "true"
    assert_response :success
    assert_equal "*", @response.headers["Access-Control-Allow-Origin"]
    assert @response.body.include? "AAIER"
    assert @response.body.include? "AAILER"
    assert_not @response.body.include? "AALLER"
    assert_not @response.body.include? "AALER"
    assert @response.body.include? "taxon_id"
    assert @response.body.include? "taxon_name"
    assert @response.body.include? "taxon_rank"
    assert_not @response.body.include? "kingdom_id"
    assert_not @response.body.include? "kingdom_name"
    assert @response.body.include? 'AAIER","taxon_id":2'
  end

  test "should get pept2lca with extra and names" do
    get :pept2lca, input: ["AAIER", "AAILER"], format: "json", extra: "true", names: "true"
    assert_response :success
    assert_equal "*", @response.headers["Access-Control-Allow-Origin"]
    assert @response.body.include? "AAIER"
    assert @response.body.include? "AAILER"
    assert_not @response.body.include? "AALLER"
    assert_not @response.body.include? "AALER"
    assert @response.body.include? "taxon_id"
    assert @response.body.include? "taxon_name"
    assert @response.body.include? "taxon_rank"
    assert @response.body.include? "kingdom_id"
    assert @response.body.include? "kingdom_name"
    assert @response.body.include? 'AAIER","taxon_id":2'
  end

  test "should get pept2lca with extra and names and il" do
    get :pept2lca, input: ["AAIER", "AAILER"], format: "json", equate_il: "true", extra: "true", names: "true"
    assert_response :success
    assert_equal "*", @response.headers["Access-Control-Allow-Origin"]
    assert @response.body.include? "AAIER"
    assert @response.body.include? "AAILER"
    assert_not @response.body.include? "AALLER"
    assert_not @response.body.include? "AALER"
    assert @response.body.include? "taxon_id"
    assert @response.body.include? "taxon_name"
    assert @response.body.include? "taxon_rank"
    assert @response.body.include? "kingdom_id"
    assert @response.body.include? "kingdom_name"
    assert @response.body.include? 'AAIER","taxon_id":1'
  end


  test "should get taxa2lca" do
    get :taxa2lca, input: ["3", "2"], format: "json"
    assert_response :success
    assert_equal "*", @response.headers["Access-Control-Allow-Origin"]
    assert @response.body.include? "taxon_id"
    assert @response.body.include? "taxon_name"
    assert @response.body.include? "taxon_rank"
    assert_not @response.body.include? "kingdom_id"
    assert_not @response.body.include? "kingdom_name"
  end

  test "should get taxa2lca with root" do
    get :taxa2lca, input: ["1", "2"], format: "json"
    assert_response :success
    assert_equal "*", @response.headers["Access-Control-Allow-Origin"]
    assert @response.body.include? "taxon_id"
    assert @response.body.include? "taxon_name"
    assert @response.body.include? "taxon_rank"
    assert_not @response.body.include? "kingdom_id"
    assert_not @response.body.include? "kingdom_name"
  end

  test "should get taxa2lca with extra" do
    get :taxa2lca, input: ["1", "2"], format: "json", extra: "true"
    assert_response :success
    assert_equal "*", @response.headers["Access-Control-Allow-Origin"]
    assert @response.body.include? "taxon_id"
    assert @response.body.include? "taxon_name"
    assert @response.body.include? "taxon_rank"
    assert @response.body.include? "kingdom_id"
    assert_not @response.body.include? "kingdom_name"
  end

  test "should get taxa2lca with names" do
    get :taxa2lca, input: ["1", "2"], format: "json", names: "true"
    assert_response :success
    assert_equal "*", @response.headers["Access-Control-Allow-Origin"]
    assert @response.body.include? "taxon_id"
    assert @response.body.include? "taxon_name"
    assert @response.body.include? "taxon_rank"
    assert_not @response.body.include? "kingdom_id"
    assert_not @response.body.include? "kingdom_name"
  end

  test "should get taxa2lca with extra and names" do
    get :taxa2lca, input: ["1", "2"], format: "json", names: "true", extra: "true"
    assert_response :success
    assert_equal "*", @response.headers["Access-Control-Allow-Origin"]
    assert @response.body.include? "taxon_id"
    assert @response.body.include? "taxon_name"
    assert @response.body.include? "taxon_rank"
    assert @response.body.include? "kingdom_id"
    assert @response.body.include? "kingdom_name"
  end


  test "should get taxonomy" do
    get :taxonomy, input: ["1", "2"], format: "json"
    assert_response :success
    assert_equal "*", @response.headers["Access-Control-Allow-Origin"]
    assert @response.body.include? "taxon_id"
    assert @response.body.include? "taxon_name"
    assert @response.body.include? "taxon_rank"
    assert_not @response.body.include? "kingdom_id"
    assert_not @response.body.include? "kingdom_name"
  end

  test "should get taxonomy with extra" do
    get :taxonomy, input: ["1", "2"], format: "json", extra: "true"
    assert_response :success
    assert_equal "*", @response.headers["Access-Control-Allow-Origin"]
    assert @response.body.include? "taxon_id"
    assert @response.body.include? "taxon_name"
    assert @response.body.include? "taxon_rank"
    assert @response.body.include? "kingdom_id"
    assert_not @response.body.include? "kingdom_name"
  end

  test "should get taxonomy with names" do
    get :taxonomy, input: ["1", "2"], format: "json", names: "true"
    assert_response :success
    assert_equal "*", @response.headers["Access-Control-Allow-Origin"]
    assert @response.body.include? "taxon_id"
    assert @response.body.include? "taxon_name"
    assert @response.body.include? "taxon_rank"
    assert_not @response.body.include? "kingdom_id"
    assert_not @response.body.include? "kingdom_name"
  end

  test "should get taxonomy with extra and names" do
    get :taxonomy, input: ["1", "2"], format: "json", names: "true", extra: "true"
    assert_response :success
    assert_equal "*", @response.headers["Access-Control-Allow-Origin"]
    assert @response.body.include? "taxon_id"
    assert @response.body.include? "taxon_name"
    assert @response.body.include? "taxon_rank"
    assert @response.body.include? "kingdom_id"
    assert @response.body.include? "kingdom_name"
  end

  test "shouldn't crash when logging to stathat" do
    Rails.application.config.unipept_API_logging = true
    Rails.application.config.unipept_stathat_key = "key"
    get :taxonomy, input: ["1", "2"], format: "json"
    assert_response :success
    Rails.application.config.unipept_API_logging = false
  end

end
