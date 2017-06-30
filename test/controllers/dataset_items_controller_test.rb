require 'test_helper'

class DatasetItemsControllerTest < ActionController::TestCase
  test 'should show datasetitem' do
    datasetitem1 = dataset_items(:datasetitem1)
    get :show, params: { 'id' => '1' }
    assert_response :success
    assert_equal datasetitem1.data, @response.body
  end
end
