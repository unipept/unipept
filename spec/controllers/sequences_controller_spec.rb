require 'spec_helper'

describe SequencesController do
  render_views
  
  describe "GET 'show'" do

      it "should be successful" do
        get :show, :id => "1"
        response.should be_success
      end
      
      it "should have valid markup" do
        get :show, :id => "1"
        response.should be_valid_xhtml
      end

      it "should have the right title" do
        get :show, :id => "1"
        response.should have_selector("title", 
                    :content => "TTSTANFGACLEEK")
      end
      
      it "should have the right h1" do
        get :show, :id => "TTSTANFGACLEEK"
        response.should have_selector("h1", 
                    :content => "TTSTANFGACLEEK")
      end
      
      it "should be successful" do
        get :show, :id => "TTSTANFGACLEEK"
        response.should be_success
      end
      
      it "should have valid markup" do
        get :show, :id => "TTSTANFGACLEEK"
        response.should be_valid_xhtml
      end

      it "should have the right title" do
        get :show, :id => "TTSTANFGACLEEK"
        response.should have_selector("title", 
                    :content => "TTSTANFGACLEEK")
      end
      
      it "should have the right h1" do
        get :show, :id => "TTSTANFGACLEEK"
        response.should have_selector("h1", 
                    :content => "TTSTANFGACLEEK")
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
                      :content => "All sequences")
        end
      end

end
