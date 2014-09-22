class SearchControllerTest < ActionController::TestCase

  test "should get search form" do
    get :single
    assert_response :success
    assert_template :single
    assert_equal "Tryptic Peptide Analysis", assigns(:title)
  end

end
