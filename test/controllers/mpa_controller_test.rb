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
    assert_equal "[\"AALER\",\"AALER\",\"AAILER\",\"MISSES\"]", assigns(:peptides)
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
    assert_equal "[\"AALER\",\"AALER\",\"AAILER\",\"MISSES\"]", assigns(:peptides)
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
    assert_equal "[\"AALER\",\"AALER\",\"AAILER\",\"MISSES\"]", assigns(:peptides)
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
    assert_equal "[\"AALER\",\"AALER\",\"AAILER\",\"MISSES\"]", assigns(:peptides)
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
    assert_equal "[\"AALER\",\"AALER\",\"AAILER\",\"MISSES\"]", assigns(:peptides)
  end

  test 'multi_search should add pride url is data comes from pride' do
    skip
    post :multi_search, params: { qs: 'AALER', search_name: 'PRIDE assay 123456' }
    assert_response :success
    assert_template :multi_search
    assert assigns(:pride_url).include?('123456')
    assert_equal 'Metaproteomics analysis result of PRIDE assay 123456', assigns(:title)
  end

  test 'multi_search should include name in title' do
    skip
    post :multi_search, params: { qs: "AALER\nAAILER\nMISSES", search_name: 'title' }
    assert_response :success
    assert_template :multi_search
    assert_equal 'Metaproteomics analysis result of title', assigns(:title)
  end
end
