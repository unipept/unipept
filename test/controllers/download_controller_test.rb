require 'test_helper'

class DownloadControllerTest < ActionController::TestCase

  test "should download post data" do
    post :download, {'data' => "data_data", "filename" => "filename.txt", "nonce" => "nonce01"}
    assert_response :success
    assert_equal "nonce01", @response.cookies["nonce"]
    assert_equal "attachment; filename=filename.txt", @response.headers["Content-Disposition"]
    assert_equal "data_data", @response.body
  end

end
