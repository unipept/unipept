require 'spec_helper'

describe "dataset_items/show" do
  before(:each) do
    @dataset_item = assign(:dataset_item, stub_model(DatasetItem,
      :name => "Name",
      :path => "Path",
      :order => 1,
      :dataset_id => 2
    ))
  end

  it "renders attributes in <p>" do
    render
    # Run the generator again with the --webrat flag if you want to use webrat matchers
    rendered.should match(/Name/)
    rendered.should match(/Path/)
    rendered.should match(/1/)
    rendered.should match(/2/)
  end
end
