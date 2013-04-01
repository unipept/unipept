require "test_helper"

describe Post do
  it "includes name in to_param" do
    post = Post.create!(title: "Hello World")
    product.title.must_equal "Hello World"
  end
end
