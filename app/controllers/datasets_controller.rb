class DatasetsController < ApplicationController
  require 'httparty'
  
  before_filter :authorize, :only => [:new, :edit, :create, :update, :destroy]
  
  # GET /datasets
  # GET /datasets.xml
  def index
    @datasets = Dataset.includes(:dataset_items).all

    respond_to do |format|
      format.html # index.html.erb
      format.xml  { render :xml => @datasets }
    end
  end

  # GET /datasets/1
  # GET /datasets/1.xml
  def show
    @dataset = Dataset.find(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.xml  { render :xml => @dataset }
    end
  end

  # GET /datasets/new
  # GET /datasets/new.xml
  def new
    @dataset = Dataset.new

    respond_to do |format|
      format.html # new.html.erb
      format.xml  { render :xml => @dataset }
    end
  end

  # GET /datasets/1/edit
  def edit
    @dataset = Dataset.find(params[:id])
  end

  # POST /datasets
  # POST /datasets.xml
  def create
    @dataset = Dataset.new(params[:dataset])

    respond_to do |format|
      if @dataset.save
        format.html { redirect_to(@dataset, :flash => { :success => 'Dataset was successfully created.' }) }
        format.xml  { render :xml => @dataset, :status => :created, :location => @dataset }
      else
        format.html { render :action => "new" }
        format.xml  { render :xml => @dataset.errors, :status => :unprocessable_entity }
      end
    end
  end

  # PUT /datasets/1
  # PUT /datasets/1.xml
  def update
    @dataset = Dataset.find(params[:id])

    respond_to do |format|
      if @dataset.update_attributes(params[:dataset])
        format.html { redirect_to(@dataset, :flash => { :success => 'Dataset was successfully updated.' }) }
        format.xml  { head :ok }
      else
        format.html { render :action => "edit" }
        format.xml  { render :xml => @dataset.errors, :status => :unprocessable_entity }
      end
    end
  end

  # DELETE /datasets/1
  # DELETE /datasets/1.xml
  def destroy
    @dataset = Dataset.find(params[:id])
    @dataset.destroy

    respond_to do |format|
      format.html { redirect_to(datasets_url) }
      format.xml  { head :ok }
    end
  end
  
  
  def pride
    response = HTTParty.get("http://www.biomart.org/biomart/martservice?query=%3C?xml%20version=%221.0%22%20encoding=%22UTF-8%22?%3E%3C!DOCTYPE%20Query%3E%3CQuery%20virtualSchemaName%20=%20%22default%22%20formatter%20=%20%22HTML%22%20header%20=%20%220%22%20uniqueRows%20=%20%220%22%20count%20=%20%22%22%20datasetConfigVersion%20=%20%220.6%22%20%3E%3CDataset%20name%20=%20%22pride%22%20interface%20=%20%22default%22%20%3E%3CFilter%20name%20=%20%22experiment_ac%22%20value%20=%20%22#{params[:id]}%22/%3E%3CAttribute%20name%20=%20%22peptide_sequence%22%20/%3E%3C/Dataset%3E%3C/Query%3E")
    resp = response.body.lines.grep(/<td>/).join.gsub(/.*<td>(.*)<\/td>.*/,"\\1")
    render :text => resp
  end
end
