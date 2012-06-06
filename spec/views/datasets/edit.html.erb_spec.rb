require 'spec_helper'

describe "datasets/edit" do
  before(:each) do
    @dataset = assign(:dataset, stub_model(Dataset,
      :environment => "MyString",
      :reference => "MyString",
      :url => "MyString",
      :project_website => "MyString"
    ))
  end

  it "renders the edit dataset form" do
    render

    # Run the generator again with the --webrat flag if you want to use webrat matchers
    assert_select "form", :action => datasets_path(@dataset), :method => "post" do
      assert_select "input#dataset_environment", :name => "dataset[environment]"
      assert_select "input#dataset_reference", :name => "dataset[reference]"
      assert_select "input#dataset_url", :name => "dataset[url]"
      assert_select "input#dataset_project_website", :name => "dataset[project_website]"
    end
  end
end
