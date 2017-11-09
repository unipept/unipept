require 'test_helper'

class MpaControllerTest < ActionController::TestCase
  test 'should get multi_search' do
    post :analyze, params: { qs: "AALER\nAALER\nAAILER\nMISSES", search_name: '' }
    assert_response :success
    assert_template :analyze
    assert_equal 'Metaproteomics analysis result', assigns(:title)
    assert_equal '', assigns(:name)
    assert_equal false, assigns(:il)
    assert_equal false, assigns(:dupes)
    assert_equal false, assigns(:missed)
    assert_equal '["AALER","AALER","AAILER","MISSES"]', assigns(:peptides)
  end

  test 'should get multi_search with il' do
    post :analyze, params: { qs: "AALER\nAALER\nAAILER\nMISSES", search_name: '', il: 1 }
    assert_response :success
    assert_template :analyze
    assert_equal 'Metaproteomics analysis result', assigns(:title)
    assert_equal '', assigns(:name)
    assert_equal true, assigns(:il)
    assert_equal false, assigns(:dupes)
    assert_equal false, assigns(:missed)
    assert_equal '["AALER","AALER","AAILER","MISSES"]', assigns(:peptides)
  end

  test 'should get multi_search with dupes' do
    post :analyze, params: { qs: "AALER\nAALER\nAAILER\nMISSES", search_name: '', dupes: 1 }
    assert_response :success
    assert_template :analyze
    assert_equal 'Metaproteomics analysis result', assigns(:title)
    assert_equal '', assigns(:name)
    assert_equal false, assigns(:il)
    assert_equal true, assigns(:dupes)
    assert_equal false, assigns(:missed)
    assert_equal '["AALER","AALER","AAILER","MISSES"]', assigns(:peptides)
  end

  test 'should get multi_search with missed' do
    post :analyze, params: { qs: "AALER\nAALER\nAAILER\nMISSES", search_name: '', missed: 1 }
    assert_response :success
    assert_template :analyze
    assert_equal 'Metaproteomics analysis result', assigns(:title)
    assert_equal '', assigns(:name)
    assert_equal false, assigns(:il)
    assert_equal false, assigns(:dupes)
    assert_equal true, assigns(:missed)
    assert_equal '["AALER","AALER","AAILER","MISSES"]', assigns(:peptides)
  end

  test 'should get multi_search with name' do
    post :analyze, params: { qs: "AALER\nAALER\nAAILER\nMISSES", search_name: 'This is a name' }
    assert_response :success
    assert_template :analyze
    assert_equal 'Metaproteomics analysis result', assigns(:title)
    assert_equal 'This is a name', assigns(:name)
    assert_equal false, assigns(:il)
    assert_equal false, assigns(:dupes)
    assert_equal false, assigns(:missed)
    assert_equal '["AALER","AALER","AAILER","MISSES"]', assigns(:peptides)
  end

  test 'should get pept2lca' do
    @request.headers['Content-Type'] = 'application/json'
    post :pept2lca, params: { peptides: %w[AALER AALER AAILER MISSES AALLERAGGAR], missed: false, equate_il: false }
    assert_response :success
    assert_template :pept2lca
    assert_equal false, assigns(:equate_il)
    assert_equal JSON.parse('{"peptides":[{"sequence":"AALER","lca":2,"lineage":[null,2,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null]},{"sequence":"AAILER","lca":1,"lineage":[null,2,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,null,null,null]}]}'), JSON.parse(response.body)
  end

  test 'should get pept2lca with missed' do
    @request.headers['Content-Type'] = 'application/json'
    post :pept2lca, params: { peptides: %w[AALER AALER AAILER MISSES AALLERAGGAR], missed: true, equate_il: false }
    assert_response :success
    assert_template :pept2lca
    assert_equal false, assigns(:equate_il)
    assert_equal JSON.parse('{"peptides":[{"sequence":"AALER","lca":2,"lineage":[null,2,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null]},{"sequence":"AAILER","lca":1,"lineage":[null,2,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,null,null,null]}]}'), JSON.parse(response.body)
  end

  test 'should get pept2lca with il' do
    @request.headers['Content-Type'] = 'application/json'
    post :pept2lca, params: { peptides: %w[AALER AALER AAILER MISSES AALLERAGGAR], missed: false, equate_il: true }
    assert_response :success
    assert_template :pept2lca
    assert_equal true, assigns(:equate_il)
    assert_equal JSON.parse('{"peptides":[{"sequence":"AALER","lca":1,"lineage":[null,2,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,null,null,null]},{"sequence":"AAILER","lca":2,"lineage":[null,2,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null]}]}'), JSON.parse(response.body)
  end

  test 'should get pept2lca with il and missed' do
    @request.headers['Content-Type'] = 'application/json'
    post :pept2lca, params: { peptides: %w[AALER AALER AAILER MISSES AALLERAGGAR], missed: true, equate_il: true }
    assert_response :success
    assert_template :pept2lca
    assert_equal true, assigns(:equate_il)
    assert_equal JSON.parse('{"peptides":[{"sequence":"AALER","lca":1,"lineage":[null,2,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,null,null,null]},{"sequence":"AAILER","lca":2,"lineage":[null,2,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null]},{"sequence":"AALLERAGGAR","lca":2,"lineage":[null,2,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null]}]}
'), JSON.parse(response.body)
  end

  test 'should get taxa' do
    @request.headers['Content-Type'] = 'application/json'
    post :taxa, params: { taxids: [1, 2, 3] }
    assert_response :success
    assert_template :taxa
    assert_equal JSON.parse('[{"id":1,"name":"species1","rank":"species"},{"id":2,"name":"kingdom1","rank":"kingdom"}]'), JSON.parse(response.body)
  end
end
