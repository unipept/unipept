require 'spec_helper'

describe "datasets/show" do
  before(:each) do
    @dataset = assign(:dataset, stub_model(Dataset,
      :environment => "Environment",
      :reference => "Reference",
      :url => "Url",
      :project_website => "Project Website"
    ))
  end

  it "renders attributes in <p>" do
    render
    # Run the generator again with the --webrat flag if you want to use webrat matchers
    rendered.should match(/Environment/)
    rendered.should match(/Reference/)
    rendered.should match(/Url/)
    rendered.should match(/Project Website/)
  end
end
