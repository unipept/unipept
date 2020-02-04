require 'test_helper'

class PrivateApiControllerTest < ActionController::TestCase
  test 'should get taxa' do
    @request.headers['Content-Type'] = 'application/json'
    post :taxa, params: { taxids: [1, 2, 3] }
    assert_response :success
    assert_template :taxa
    assert_equal JSON.parse('[{"id":1,"name":"species1","rank":"species"},{"id":2,"name":"kingdom1","rank":"kingdom"}]'), JSON.parse(response.body)
  end

  test 'should get go terms' do
    @request.headers['Content-Type'] = 'application/json'
    post :goterms, params: { goterms: ["go:12345"] }
    assert_response :success
    assert_template :goterms
    assert_equal [{"code"=>"GO:12345", "name"=>"some function", "namespace"=>"cellular component"}], JSON.parse(response.body)
  end

  test 'should get ec numbers' do
    @request.headers['Content-Type'] = 'application/json'
    post :ecnumbers, params: { ecnumbers: ["1.2.3.4"] }
    assert_response :success
    assert_template :ecnumbers
    assert_equal [{"code"=>"1.2.3.4", "name"=>"Some Enzyme"}], JSON.parse(response.body)
  end

  test 'should get interpro entries' do
    @request.headers['Content-Type'] = 'application/json'
    post :ecnumbers, params: { interpros: ["IPR000126"] }
    assert_response :success
    assert_template :ecnumbers
    assert_equal [{"code"=>"IPR000126", "name"=>"Serine proteases, V8 family, serine active site", "category"=>"Active_site"}], JSON.parse(response.body)
  end
end
