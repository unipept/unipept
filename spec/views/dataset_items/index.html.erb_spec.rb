require 'spec_helper'

describe "dataset_items/index" do
  before(:each) do
    assign(:dataset_items, [
      stub_model(DatasetItem,
        :name => "Name",
        :path => "Path",
        :order => 1,
        :dataset_id => 2
      ),
      stub_model(DatasetItem,
        :name => "Name",
        :path => "Path",
        :order => 1,
        :dataset_id => 2
      )
    ])
  end

  it "renders a list of dataset_items" do
    render
    # Run the generator again with the --webrat flag if you want to use webrat matchers
    assert_select "tr>td", :text => "Name".to_s, :count => 2
    assert_select "tr>td", :text => "Path".to_s, :count => 2
    assert_select "tr>td", :text => 1.to_s, :count => 2
    assert_select "tr>td", :text => 2.to_s, :count => 2
  end
end
