require 'test_helper'

class Api::ApidocsControllerTest < ActionController::TestCase
  test 'should get index' do
    get :index
    assert_response :success
    assert_template :index
    assert_equal 'Unipept API', assigns(:title)
    assert_equal 'Overview', assigns(:sidebar_name)
    assert_not_nil assigns(:sidebar_nav)
    assert_nil assigns(:sidebar_subnav)
  end

  test 'should get pept2prot' do
    get :pept2prot
    assert_response :success
    assert_template :pept2prot
    assert_equal 'pept2prot', assigns(:title)
    assert_equal 'pept2prot', assigns(:sidebar_name)
    assert_not_nil assigns(:sidebar_nav)
    assert_not_nil assigns(:sidebar_subnav)
  end

  test 'should get pept2taxa' do
    get :pept2taxa
    assert_response :success
    assert_template :pept2taxa
    assert_equal 'pept2taxa', assigns(:title)
    assert_equal 'pept2taxa', assigns(:sidebar_name)
    assert_not_nil assigns(:sidebar_nav)
    assert_not_nil assigns(:sidebar_subnav)
  end

  test 'should get pept2lca' do
    get :pept2lca
    assert_response :success
    assert_template :pept2lca
    assert_equal 'pept2lca', assigns(:title)
    assert_equal 'pept2lca', assigns(:sidebar_name)
    assert_not_nil assigns(:sidebar_nav)
    assert_not_nil assigns(:sidebar_subnav)
  end

  test 'should get taxa2lca' do
    get :taxa2lca
    assert_response :success
    assert_template :taxa2lca
    assert_equal 'taxa2lca', assigns(:title)
    assert_equal 'taxa2lca', assigns(:sidebar_name)
    assert_not_nil assigns(:sidebar_nav)
    assert_not_nil assigns(:sidebar_subnav)
  end

  test 'should get taxonomy' do
    get :taxonomy
    assert_response :success
    assert_template :taxonomy
    assert_equal 'taxonomy', assigns(:title)
    assert_equal 'taxonomy', assigns(:sidebar_name)
    assert_not_nil assigns(:sidebar_nav)
    assert_not_nil assigns(:sidebar_subnav)
  end
end
