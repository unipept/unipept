require 'test_helper'

class DatasetsControllerTest < ActionController::TestCase
  test 'should get index' do
    get :index
    assert_response :success
    assert_template :index
    assert_equal 'Metaproteomics Analysis', assigns(:title)
    assert_not_nil assigns(:datasets)
  end

  test 'should redirect when not signed in' do
    get :new
    assert_equal 'Please log in to use this feature', flash[:error]
    assert_redirected_to root_url

    get :edit, params: { 'id' => '1' }
    assert_equal 'Please log in to use this feature', flash[:error]
    assert_redirected_to root_url

    post :create
    assert_equal 'Please log in to use this feature', flash[:error]
    assert_redirected_to root_url

    put :update, params: { 'id' => '1' }
    assert_equal 'Please log in to use this feature', flash[:error]
    assert_redirected_to root_url

    delete :destroy, params: { 'id' => '1' }
    assert_equal 'Please log in to use this feature', flash[:error]
    assert_redirected_to root_url
  end

  test 'should redirect when not admin' do
    sign_in users(:bart)
    get :new
    assert_equal 'Please log in to use this feature', flash[:error]
    assert_redirected_to root_url

    get :edit, params: { 'id' => '1' }
    assert_equal 'Please log in to use this feature', flash[:error]
    assert_redirected_to root_url

    post :create
    assert_equal 'Please log in to use this feature', flash[:error]
    assert_redirected_to root_url

    put :update, params: { 'id' => '1' }
    assert_equal 'Please log in to use this feature', flash[:error]
    assert_redirected_to root_url

    delete :destroy, params: { 'id' => '1' }
    assert_equal 'Please log in to use this feature', flash[:error]
    assert_redirected_to root_url
  end

  test 'should preload' do
    skip
    get :preload, params: { id: 1, type: 'type' }
    assert_response :success
    assert_template :preload
    assert_equal 'Load dataset', assigns(:title)
    assert_equal '1', assigns(:id)
    assert_equal 'type', assigns(:type)
  end
end
