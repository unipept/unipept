require 'spec_helper'

describe "datasets/index" do
  before(:each) do
    assign(:datasets, [
      stub_model(Dataset,
        :environment => "Environment",
        :reference => "Reference",
        :url => "Url",
        :project_website => "Project Website"
      ),
      stub_model(Dataset,
        :environment => "Environment",
        :reference => "Reference",
        :url => "Url",
        :project_website => "Project Website"
      )
    ])
  end

  it "renders a list of datasets" do
    render
    # Run the generator again with the --webrat flag if you want to use webrat matchers
    assert_select "tr>td", :text => "Environment".to_s, :count => 2
    assert_select "tr>td", :text => "Reference".to_s, :count => 2
    assert_select "tr>td", :text => "Url".to_s, :count => 2
    assert_select "tr>td", :text => "Project Website".to_s, :count => 2
  end
end
