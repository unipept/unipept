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
end