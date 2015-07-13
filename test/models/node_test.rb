require 'test_helper'

class NodeTest < ActiveSupport::TestCase
  test 'should have Node as model name' do
    assert_equal Node, Node.model_name
  end

  test 'should have partial path' do
    assert_equal 'nodes/node', Node.partial_path
  end
end
