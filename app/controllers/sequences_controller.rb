class SequencesController < ApplicationController

  def show
    if params[:sequence]
      @sequence = Sequence.find_by_sequence(params[:sequence])
    else
      @sequence = Sequence.find(params[:id])
    end
    @title = @sequence.sequence
    
    respond_to do |format|
      format.html # show.html.erb
      format.xml  { render :xml => @sequence }
      format.json { render :json => @sequence }
    end
  end
  
  def index
    @title = "All sequences"
    @sequences = Sequence.paginate(:page => params[:page])
  end
end