require 'test_helper'

class DatasetsControllerTest < ActionController::TestCase

  test "should get index" do
    get :index
    assert_response :success
    assert_template :index
    assert_equal "Metaproteomics Analysis", assigns(:title)
    assert_not_nil assigns(:datasets)
  end

  test "should show dataset" do
    dataset1 = datasets(:dataset1)
    get :show, {'id' => "1"}
    assert_response :success
    assert_template :show
    assert_equal dataset1, assigns(:dataset)
  end

  test "should give 404 when show dataset doesn't exist" do
    skip
    get :show, {'id' => "-11"}
  end

  test "should show new dataset form" do
    sign_in users(:bart_admin)
    get :new
    assert_response :success
    assert_template :new
    assert_not_nil assigns(:dataset)
  end

  test "should show dataset edit form" do
    sign_in users(:bart_admin)
    dataset1 = datasets(:dataset1)
    get :edit, {'id' => "1"}
    assert_response :success
    assert_template :edit
    assert_equal dataset1, assigns(:dataset)
  end

  test "should give 404 when edit dataset doesn't exist" do
    skip
    sign_in users(:bart_admin)
    get :edit, {'id' => "-1"}
  end

  test "should create dataset" do
    sign_in users(:bart_admin)
    assert_difference('Dataset.count') do
      post :create, dataset: {environment: 'env', reference: 'ref', url: 'url', project_website: 'web'}
    end
    assert_equal "Dataset was successfully created.", flash[:success]
    assert_redirected_to dataset_path(assigns(:dataset))
  end

  test "should render new when trying to create dataset with invalid fields" do
    sign_in users(:bart_admin)
    post :create, dataset: {environment: 'Some title'}
    assert_response :success
    assert_template :new
  end

  test "should update dataset" do
    sign_in users(:bart_admin)
    put :update, {id: "1", dataset: {environment: 'env', reference: 'ref', url: 'url', project_website: 'web'}}
    assert_equal "env", assigns(:dataset).environment
    assert_equal "Dataset was successfully updated.", flash[:success]
    assert_redirected_to dataset_path(assigns(:dataset))
  end

  test "should render edit when trying to update dataset with invalid fields" do
    sign_in users(:bart_admin)
    put :update, {id: "1", dataset: {environment: nil, reference: 'ref', url: 'url', project_website: 'web'}}
    assert_response :success
    assert_template :edit
  end

  test "should destroy dataset" do
    sign_in users(:bart_admin)
    assert_difference('Dataset.count', -1) do
      delete :destroy, {'id' => "1"}
    end
    assert_redirected_to datasets_path
  end

  test "should redirect when not signed in" do
    get :new
    assert_equal "Please log in to use this feature", flash[:error]
    assert_redirected_to root_url

    get :edit, {'id' => "1"}
    assert_equal "Please log in to use this feature", flash[:error]
    assert_redirected_to root_url

    post :create
    assert_equal "Please log in to use this feature", flash[:error]
    assert_redirected_to root_url

    put :update, {'id' => "1"}
    assert_equal "Please log in to use this feature", flash[:error]
    assert_redirected_to root_url

    delete :destroy, {'id' => "1"}
    assert_equal "Please log in to use this feature", flash[:error]
    assert_redirected_to root_url
  end

  test "should redirect when not admin" do
    sign_in users(:bart)
    get :new
    assert_equal "Please log in to use this feature", flash[:error]
    assert_redirected_to root_url

    get :edit, {'id' => "1"}
    assert_equal "Please log in to use this feature", flash[:error]
    assert_redirected_to root_url

    post :create
    assert_equal "Please log in to use this feature", flash[:error]
    assert_redirected_to root_url

    put :update, {'id' => "1"}
    assert_equal "Please log in to use this feature", flash[:error]
    assert_redirected_to root_url

    delete :destroy, {'id' => "1"}
    assert_equal "Please log in to use this feature", flash[:error]
    assert_redirected_to root_url
  end

  test "should preload" do
    get :preload, id: 1, type: "type"
    assert_response :success
    assert_template :preload
    assert_equal "Load dataset", assigns(:title)
    assert_equal "1", assigns(:id)
    assert_equal "type", assigns(:type)
  end

end
