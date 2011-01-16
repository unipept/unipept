require 'spec_helper'

describe SequencesController do
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
                    :content => "TTSTANFGACLEEK")
      end
      
      it "should have the right h1" do
        get :show, :id => 1
        response.should have_selector("h1", 
                    :content => "TTSTANFGACLEEK")
      end
    end

end
