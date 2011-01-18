class SequencesController < ApplicationController

  def show
    #id or sequence?
    if params[:id].match(/\A[0-9]+\z/)
      @sequence = Sequence.find_by_id(params[:id], :include => {:peptides => :organism})
    else  
      @sequence = Sequence.find_by_sequence(params[:id], :include => {:peptides => :organism})
    end
    
    #error on nil
    if @sequence.nil?
      flash[:error] = "No matches for #{params[:id]}"
      redirect_to sequences_path
    else
      @title = @sequence.sequence
      respond_to do |format|
        format.html # show.html.erb
        format.xml  { render :xml => @sequence }
        format.json { render :json => @sequence }
      end
    end
  end
  
  def index
    @title = "All sequences"
    @sequences = Sequence.paginate(:page => params[:page])
  end
  
  def search
    redirect_to "#{sequences_path}/#{params[:q]}"
  end
end