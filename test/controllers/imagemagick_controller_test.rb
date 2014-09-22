class ImagemagickControllerTest < ActionController::TestCase

  test "should generate image" do
    post :convert, {'image' => "<svg width=\"930\" height=\"600\"></svg>"}
    assert_response :success
    assert @response.body.start_with? "data:image/png;base64,"
  end

end
