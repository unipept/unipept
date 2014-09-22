require 'test_helper'

class PeptidomeControllerTest < ActionController::TestCase

  test "should get analyze" do
    get :analyze
    assert_response :success
    assert_template :analyze
    assert_equal "Peptidome Analysis", assigns(:title)
    assert_equal "peptidefinder", assigns(:tab)
    assert_not_nil assigns(:species)
    assert_not_nil assigns(:genomes)
    assert_not_nil assigns(:taxa)
  end

  test "should set correct title for analyze peptidefinder" do
    get :analyze, tab: "peptidefinder"
    assert_response :success
    assert_template :analyze
    assert_equal "Unique Peptide Finder", assigns(:title)
    assert_equal "peptidefinder", assigns(:tab)
  end

  test "should set correct title for analyze peptidomeclustering" do
    get :analyze, tab: "peptidomeclustering"
    assert_response :success
    assert_template :analyze
    assert_equal "Peptidome Clustering", assigns(:title)
    assert_equal "peptidomeclustering", assigns(:tab)
  end

end
