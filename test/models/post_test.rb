require "test_helper"

describe Post do
  it "must have a name" do
    post = Post.new
    post.save.must_equal false
  end
end
