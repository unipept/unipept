require 'test_helper'

class PostTest < ActiveSupport::TestCase

  test "should not save post without title" do
    post = Post.new
    post.content = "test"
    post.date = "01-01-1990"
    assert_not post.save, "Saved the post without a title"
  end

  test "should not save post with too long title" do
    post = Post.new
    post.title = "a" * 150
    post.content = "test"
    post.date = "01-01-1990"
    assert_not post.save, "Saved the post with too long title"
  end

  test "should not save post without content" do
    post = Post.new
    post.title = "test"
    post.date = "01-01-1990"
    assert_not post.save, "Saved the post without content"
  end

  test "should not save post without date" do
    post = Post.new
    post.title = "test"
    post.content = "test"
    assert_not post.save, "Saved the post without date"
  end

  test "should not save post without valid date" do
    post = Post.new
    post.title = "test"
    post.content = "test"
    post.date = "test"
    assert_not post.save, "Saved the post without valid date"
  end

  test "should save post with valid fields" do
    post = Post.new
    post.title = "test"
    post.content = "test"
    post.date = "01-01-1090"
    assert post.save, "Unable to save the post with valid fields"
  end
end