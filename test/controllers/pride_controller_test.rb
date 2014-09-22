class PrideControllerTest < ActionController::TestCase

  test "should load PRIDE data" do
    get :load, {'id' => "8500"}
    assert_response :success
    assert @response.body.start_with? "VVSVLTVLHQDWLNGK\nHYEGSTVPEKK"
  end

end
