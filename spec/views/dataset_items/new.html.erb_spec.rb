require 'spec_helper'

describe "dataset_items/new" do
  before(:each) do
    assign(:dataset_item, stub_model(DatasetItem,
      :name => "MyString",
      :path => "MyString",
      :order => 1,
      :dataset_id => 1
    ).as_new_record)
  end

  it "renders new dataset_item form" do
    render

    # Run the generator again with the --webrat flag if you want to use webrat matchers
    assert_select "form", :action => dataset_items_path, :method => "post" do
      assert_select "input#dataset_item_name", :name => "dataset_item[name]"
      assert_select "input#dataset_item_path", :name => "dataset_item[path]"
      assert_select "input#dataset_item_order", :name => "dataset_item[order]"
      assert_select "input#dataset_item_dataset_id", :name => "dataset_item[dataset_id]"
    end
  end
end
