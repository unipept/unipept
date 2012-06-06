require "spec_helper"

describe DatasetsController do
  describe "routing" do

    it "routes to #index" do
      get("/datasets").should route_to("datasets#index")
    end

    it "routes to #new" do
      get("/datasets/new").should route_to("datasets#new")
    end

    it "routes to #show" do
      get("/datasets/1").should route_to("datasets#show", :id => "1")
    end

    it "routes to #edit" do
      get("/datasets/1/edit").should route_to("datasets#edit", :id => "1")
    end

    it "routes to #create" do
      post("/datasets").should route_to("datasets#create")
    end

    it "routes to #update" do
      put("/datasets/1").should route_to("datasets#update", :id => "1")
    end

    it "routes to #destroy" do
      delete("/datasets/1").should route_to("datasets#destroy", :id => "1")
    end

  end
end
