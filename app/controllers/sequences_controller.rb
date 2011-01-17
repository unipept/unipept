class SequencesController < ApplicationController

  def show
    if params[:id].match(/\A[0-9]+\z/)
      @sequence = Sequence.find_by_id(params[:id], :include => {:peptides => :organism})
    else  
      @sequence = Sequence.find_by_sequence(params[:id], :include => {:peptides => :organism})
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