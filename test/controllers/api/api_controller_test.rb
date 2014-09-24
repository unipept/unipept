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

  test "should get messages" do
    get :messages
    assert_response :success
    skip
  end

  test "should get pept2prot" do
    skip
    get :pept2prot
    assert_resonse :success
    assert_equal "*", @response.headers["Access-Control-Allow-Origin"]
  end

end
