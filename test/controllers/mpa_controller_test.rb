require 'test_helper'

class MpaControllerTest < ActionController::TestCase
  # test 'should get multi_search' do
  #   post :analyze, params: { qs: "AALER\nAALER\nAAILER\nMISSES", search_name: '' }
  #   assert_response :success
  #   assert_template :analyze
  #   assert_equal 'Metaproteomics analysis result', assigns(:title)
  #   assert_equal '', assigns(:name)
  #   assert_equal false, assigns(:il)
  #   assert_equal false, assigns(:dupes)
  #   assert_equal false, assigns(:missed)
  #   assert_equal '["AALER","AALER","AAILER","MISSES"]', assigns(:peptides)
  # end

  # test 'should get multi_search with il' do
  #   post :analyze, params: { qs: "AALER\nAALER\nAAILER\nMISSES", search_name: '', il: 1 }
  #   assert_response :success
  #   assert_template :analyze
  #   assert_equal 'Metaproteomics analysis result', assigns(:title)
  #   assert_equal '', assigns(:name)
  #   assert_equal true, assigns(:il)
  #   assert_equal false, assigns(:dupes)
  #   assert_equal false, assigns(:missed)
  #   assert_equal '["AALER","AALER","AAILER","MISSES"]', assigns(:peptides)
  # end

  # test 'should get multi_search with dupes' do
  #   post :analyze, params: { qs: "AALER\nAALER\nAAILER\nMISSES", search_name: '', dupes: 1 }
  #   assert_response :success
  #   assert_template :analyze
  #   assert_equal 'Metaproteomics analysis result', assigns(:title)
  #   assert_equal '', assigns(:name)
  #   assert_equal false, assigns(:il)
  #   assert_equal true, assigns(:dupes)
  #   assert_equal false, assigns(:missed)
  #   assert_equal '["AALER","AALER","AAILER","MISSES"]', assigns(:peptides)
  # end

  # test 'should get multi_search with missed' do
  #   post :analyze, params: { qs: "AALER\nAALER\nAAILER\nMISSES", search_name: '', missed: 1 }
  #   assert_response :success
  #   assert_template :analyze
  #   assert_equal 'Metaproteomics analysis result', assigns(:title)
  #   assert_equal '', assigns(:name)
  #   assert_equal false, assigns(:il)
  #   assert_equal false, assigns(:dupes)
  #   assert_equal true, assigns(:missed)
  #   assert_equal '["AALER","AALER","AAILER","MISSES"]', assigns(:peptides)
  # end

  # test 'should get multi_search with name' do
  #   post :analyze, params: { qs: "AALER\nAALER\nAAILER\nMISSES", search_name: 'This is a name' }
  #   assert_response :success
  #   assert_template :analyze
  #   assert_equal 'Metaproteomics analysis result', assigns(:title)
  #   assert_equal 'This is a name', assigns(:name)
  #   assert_equal false, assigns(:il)
  #   assert_equal false, assigns(:dupes)
  #   assert_equal false, assigns(:missed)
  #   assert_equal '["AALER","AALER","AAILER","MISSES"]', assigns(:peptides)
  # end

  # test 'should get pept2data' do
  #   @request.headers['Content-Type'] = 'application/json'
  #   post :pept2data, params: { peptides: %w[AALER AALER AAILER MISSES AALLERAGGAR], missed: false, equate_il: false }
  #   assert_response :success
  #   assert_template :pept2data
  #   assert_equal false, assigns(:equate_il)
  #   assert_equal ({ 'peptides' => [{ 'sequence' => 'AAILER', 'lca' => 1, 'lineage' => [nil, 2, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, 1, nil, nil, nil], 'fa' => { 'counts' => { 'all' => 1, 'EC' => 1, 'GO' => 1 }, 'data' => { 'GO:0005576' => 1, 'GO:0000287' => 1, 'GO:0004634' => 1, 'GO:0000015' => 1, 'GO:0006096' => 1, 'EC:4.2.1.11' => 1, 'GO:0009986' => 1 } } }, { 'sequence' => 'AALER', 'lca' => 2, 'lineage' => [nil, 2, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil], 'fa' => { 'counts' => { 'all' => 1, 'EC' => 1, 'GO' => 1 }, 'data' => { 'GO:0016569' => 1, 'GO:0006281' => 1, 'GO:0000781' => 1, 'EC:2.7.11.1' => 1 } } }] })["peptides"].to_set, JSON.parse(response.body)["peptides"].to_set
  # end

  # test 'should get pept2data with missed' do
  #   @request.headers['Content-Type'] = 'application/json'
  #   post :pept2data, params: { peptides: %w[AALER AALER AAILER MISSES AALLERAGGAR], missed: true, equate_il: false }
  #   assert_response :success
  #   assert_template :pept2data
  #   assert_equal false, assigns(:equate_il)
  #   assert_equal ({ 'peptides' => [{ 'sequence' => 'AAILER', 'lca' => 1, 'lineage' => [nil, 2, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, 1, nil, nil, nil], 'fa' => { 'counts' => { 'all' => 1, 'EC' => 1, 'GO' => 1 }, 'data' => { 'GO:0005576' => 1, 'GO:0000287' => 1, 'GO:0004634' => 1, 'GO:0000015' => 1, 'GO:0006096' => 1, 'EC:4.2.1.11' => 1, 'GO:0009986' => 1 } } }, { 'sequence' => 'AALER', 'lca' => 2, 'lineage' => [nil, 2, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil], 'fa' => { 'counts' => { 'all' => 1, 'EC' => 1, 'GO' => 1 }, 'data' => { 'GO:0016569' => 1, 'GO:0006281' => 1, 'GO:0000781' => 1, 'EC:2.7.11.1' => 1 } } }] })["peptides"].to_set, JSON.parse(response.body)["peptides"].to_set
  # end

  # test 'should get pept2data with il' do
  #   @request.headers['Content-Type'] = 'application/json'
  #   post :pept2data, params: { peptides: %w[AALER AALER AAILER MISSES AALLERAGGAR], missed: false, equate_il: true }
  #   assert_response :success
  #   assert_template :pept2data
  #   assert_equal true, assigns(:equate_il)
  #   assert_equal JSON.parse('{"peptides":[{"sequence":"AAILER","lca":2,"lineage":[null,2,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],"fa":{"counts":{"all":0,"EC":0,"GO":0},"data":{}}},{"sequence":"AALER","lca":1,"lineage":[null,2,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,null,null,null],"fa":{"counts":{"all":22,"EC":4,"GO":2},"data":{"EC:2.7.11.1":4,"GO:0004674":1,"GO:0005634":1,"GO:0005524":1,"GO:0016301":1}}}]}')["peptides"].to_set, JSON.parse(response.body)["peptides"].to_set
  # end

  # test 'should get pept2data with il and missed' do
  #   @request.headers['Content-Type'] = 'application/json'
  #   post :pept2data, params: { peptides: %w[AALER AALER AAILER MISSES AALLERAGGAR], missed: true, equate_il: true }
  #   assert_response :success
  #   assert_template :pept2data
  #   assert_equal true, assigns(:equate_il)
  #   assert_equal JSON.parse('{"peptides":[{"sequence":"AAILER","lca":2,"lineage":[null,2,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],"fa":{"counts":{"all":0,"EC":0,"GO":0},"data":{}}},{"sequence":"AALER","lca":1,"lineage":[null,2,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,null,null,null],"fa":{"counts":{"all":22,"EC":4,"GO":2},"data":{"EC:2.7.11.1":4,"GO:0004674":1,"GO:0005634":1,"GO:0005524":1,"GO:0016301":1}}},{"sequence":"AALLERAGGAR","lca":2,"lineage":[null,2,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],"fa":{"counts":{"all":1,"EC":0,"GO":0},"data":{}}}]}')["peptides"].to_set, JSON.parse(response.body)["peptides"].to_set
  # end
end
