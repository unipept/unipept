class DatasetItemsController < ApplicationController
  # GET /dataset_items
  # GET /dataset_items.xml
  def index
    @dataset_items = DatasetItem.all

    respond_to do |format|
      format.html # index.html.erb
      format.xml  { render :xml => @dataset_items }
    end
  end

  # GET /dataset_items/1
  # GET /dataset_items/1.xml
  def show
    @dataset_item = DatasetItem.find(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.xml  { render :xml => @dataset_item }
    end
  end

  # GET /dataset_items/new
  # GET /dataset_items/new.xml
  def new
    @dataset_item = DatasetItem.new

    respond_to do |format|
      format.html # new.html.erb
      format.xml  { render :xml => @dataset_item }
    end
  end

  # GET /dataset_items/1/edit
  def edit
    @dataset_item = DatasetItem.find(params[:id])
  end

  # POST /dataset_items
  # POST /dataset_items.xml
  def create
    @dataset_item = DatasetItem.new(params[:dataset_item])

    respond_to do |format|
      if @dataset_item.save
        format.html { redirect_to(@dataset_item, :notice => 'Dataset item was successfully created.') }
        format.xml  { render :xml => @dataset_item, :status => :created, :location => @dataset_item }
      else
        format.html { render :action => "new" }
        format.xml  { render :xml => @dataset_item.errors, :status => :unprocessable_entity }
      end
    end
  end

  # PUT /dataset_items/1
  # PUT /dataset_items/1.xml
  def update
    @dataset_item = DatasetItem.find(params[:id])

    respond_to do |format|
      if @dataset_item.update_attributes(params[:dataset_item])
        format.html { redirect_to(@dataset_item, :notice => 'Dataset item was successfully updated.') }
        format.xml  { head :ok }
      else
        format.html { render :action => "edit" }
        format.xml  { render :xml => @dataset_item.errors, :status => :unprocessable_entity }
      end
    end
  end

  # DELETE /dataset_items/1
  # DELETE /dataset_items/1.xml
  def destroy
    @dataset_item = DatasetItem.find(params[:id])
    @dataset_item.destroy

    respond_to do |format|
      format.html { redirect_to(dataset_items_url) }
      format.xml  { head :ok }
    end
  end
end
