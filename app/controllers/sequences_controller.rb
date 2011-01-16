class SequencesController < ApplicationController

  def show
    @sequence = Sequence.find(params[:id])
    @title = @sequence.sequence
    
    respond_to do |format|
      format.html # show.html.erb
      format.xml  { render :xml => @sequence }
      format.json { render :json => @sequence }
    end
  end
  
  def index
    @title = "All sequences"
    @sequences = Sequence.limit(100)
    
    respond_to do |format|
      format.html # index.html.erb
      format.xml  { render :xml => @sequences }
      format.json { render :json => @sequences }
    end
  end
end