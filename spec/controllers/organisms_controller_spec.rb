require 'spec_helper'

describe OrganismsController do
  render_views
  
  describe "GET 'show'" do

      it "should be successful" do
        get :show, :id => 1
        response.should be_success
      end
      
      it "should have valid markup" do
        get :show, :id => 1
        response.should be_valid_xhtml
      end

      it "should have the right title" do
        get :show, :id => 1
        response.should have_selector("title", 
                    :content => "Clostridium perfringens")
      end
      
      it "should have the right h1" do
        get :show, :id => 1
        response.should have_selector("h1", 
                    :content => "Clostridium perfringens")
      end
    end
    
    describe "GET 'index'" do

        it "should be successful" do
          get :index
          response.should be_success
        end

        it "should have valid markup" do
          get :index
          response.should be_valid_xhtml
        end

        it "should have the right title" do
          get :index
          response.should have_selector("title", 
                      :content => "All organisms")
        end
      end

end
