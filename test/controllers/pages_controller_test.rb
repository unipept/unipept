require 'test_helper'

class PagesControllerTest < ActionController::TestCase

  test "should get home" do
    get :home
    assert_response :success
    assert_template :home
    assert_equal "Home", assigns(:title)
    assert_not_nil assigns(:post)
  end

  test "should get about" do
    get :about
    assert_response :success
    assert_template :about
    assert_equal "About", assigns(:title)
  end

  test "should get contact" do
    get :contact
    assert_response :success
    assert_template :contact
    assert_equal "Contact", assigns(:title)
  end

  test "should get admin" do
    sign_in users(:bart_admin)
    get :admin
    assert_response :success
    assert_template :admin
    assert_equal "Admin", assigns(:title)
  end

  test "should get admin with progress" do
    sign_in users(:bart_admin)
    path = Rails.root.join("public", "progress")
    content = "test"
    File.open(path, "w+") do |f|
      f.write(content)
    end
    get :admin
    File.delete(path)
    assert_response :success
    assert_template :admin
    assert_equal "Admin", assigns(:title)
    assert assigns(:progress)
  end

  test "should redirect when not signed in" do
    get :admin
    assert_equal "Please log in to use this feature", flash[:error]
    assert_redirected_to root_url
  end

  test "should redirect when not admin" do
    sign_in users(:bart)
    get :admin
    assert_equal "Please log in to use this feature", flash[:error]
    assert_redirected_to root_url
  end

end
