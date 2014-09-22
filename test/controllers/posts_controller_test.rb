class PostsControllerTest < ActionController::TestCase

  test "should get index" do
    get :index
    assert_response :success
    assert_template :index
    assert_not_nil assigns(:posts)
  end

  test "should show post" do
    post1 = posts(:post1)
    get :show, {'id' => "1"}
    assert_response :success
    assert_template :show
    assert_equal post1, assigns(:post)
  end

  test "should show new post form" do
    sign_in users(:bart_admin)
    get :new
    assert_response :success
    assert_template :new
    assert_not_nil assigns(:post)
  end

  test "should show post edit form" do
    sign_in users(:bart_admin)
    post1 = posts(:post1)
    get :edit, {'id' => "1"}
    assert_response :success
    assert_template :edit
    assert_equal post1, assigns(:post)
  end

  test "should create post" do
    sign_in users(:bart_admin)
    assert_difference('Post.count') do
      post :create, post: {title: 'Some title', content: 'content', date: '01-01-1999'}
    end
    assert_equal "Post was successfully created.", flash[:success]
    assert_redirected_to post_path(assigns(:post))
  end

  test "should render new when trying to create post with invalid fields" do
    sign_in users(:bart_admin)
    post :create, post: {title: 'Some title'}
    assert_response :success
    assert_template :new
  end

  test "should update post" do
    sign_in users(:bart_admin)
    put :update, {id: "1", post: {title: 'new title', content: 'content', date: '01-01-1999'}}
    assert_equal "new title", assigns(:post).title
    assert_equal "Post was successfully updated.", flash[:success]
    assert_redirected_to post_path(assigns(:post))
  end

  test "should render edit when trying to update post with invalid fields" do
    sign_in users(:bart_admin)
    put :update, {id: "1", post: {title: nil, content: 'content', date: '01-01-1999'}}
    assert_response :success
    assert_template :edit
  end

  test "should destroy post" do
    sign_in users(:bart_admin)
    assert_difference('Post.count', -1) do
      delete :destroy, {'id' => "1"}
    end
    assert_redirected_to posts_path
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

end
