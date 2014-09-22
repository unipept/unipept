class DatasetItemsControllerTest < ActionController::TestCase

  test "should show datasetitem" do
    datasetitem1 = dataset_items(:datasetitem1)
    get :show, {'id' => "1"}
    assert_response :success
    assert_equal datasetitem1.data, @response.body
  end

  test "should give 404 when show datasetitem doesn't exist" do
    skip
    get :show, {'id' => "-11"}
  end

end
