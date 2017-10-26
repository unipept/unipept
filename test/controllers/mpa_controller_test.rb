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
end
