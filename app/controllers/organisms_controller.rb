class OrganismsController < ApplicationController

  def show
    @organism = Organism.find_by_id(params[:id])
    if @organism.nil?
      flash[:error] = "No matches for #{params[:id]}"
      redirect_to organisms_path
    else
      @peptides = @organism.peptides.paginate(:page => params[:page], :include => :sequence)
      @title = @organism.name
    
      respond_to do |format|
        format.html # show.html.erb
        format.xml  { render :xml => @organism }
        format.json { render :json => @organism }
      end
    end
  end
  
  def index
    @title = "All organisms"
    @organisms = Organism.paginate(:page => params[:page])
  end
end