require "spec_helper"

describe DatasetItemsController do
  describe "routing" do

    it "routes to #index" do
      get("/dataset_items").should route_to("dataset_items#index")
    end

    it "routes to #new" do
      get("/dataset_items/new").should route_to("dataset_items#new")
    end

    it "routes to #show" do
      get("/dataset_items/1").should route_to("dataset_items#show", :id => "1")
    end

    it "routes to #edit" do
      get("/dataset_items/1/edit").should route_to("dataset_items#edit", :id => "1")
    end

    it "routes to #create" do
      post("/dataset_items").should route_to("dataset_items#create")
    end

    it "routes to #update" do
      put("/dataset_items/1").should route_to("dataset_items#update", :id => "1")
    end

    it "routes to #destroy" do
      delete("/dataset_items/1").should route_to("dataset_items#destroy", :id => "1")
    end

  end
end
