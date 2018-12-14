class DatasetsController < ApplicationController
  before_action :default_format_json, only: %i[sampledata]
  before_action :authorize, only: %i[new edit create update destroy]

  # GET /datasets
  # GET /datasets.xml
  def index
    @title = 'Metaproteomics Analysis'
    @header_class = 'MPA'
    @datasets = Dataset.includes(:dataset_items).all

    respond_to do |format|
      format.html # index.html.erb
      format.xml  { render xml: @datasets }
    end
  end

  # GET /datasets/1
  # GET /datasets/1.xml
  def show
    @dataset = Dataset.find(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.xml  { render xml: @dataset }
    end
  end

  # GET /datasets/new
  # GET /datasets/new.xml
  def new
    @dataset = Dataset.new

    respond_to do |format|
      format.html # new.html.erb
      format.xml  { render xml: @dataset }
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
        format.html { redirect_to(@dataset, flash: { success: 'Dataset was successfully created.' }) }
        format.xml  { render xml: @dataset, status: :created, location: @dataset }
      else
        format.html { render action: 'new' }
        format.xml  { render xml: @dataset.errors, status: :unprocessable_entity }
      end
    end
  end

  # PUT /datasets/1
  # PUT /datasets/1.xml
  def update
    @dataset = Dataset.find(params[:id])

    respond_to do |format|
      if @dataset.update_attributes(params[:dataset])
        format.html { redirect_to(@dataset, flash: { success: 'Dataset was successfully updated.' }) }
        format.xml  { head :ok }
      else
        format.html { render action: 'edit' }
        format.xml  { render xml: @dataset.errors, status: :unprocessable_entity }
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

  def preload
    @title = 'Load dataset'
    @header_class = 'MPA'
    @type = params[:type]
    @id = params[:id]
  end

  def sampledata
    @datasets = Dataset.includes(:dataset_items).all
    puts @datasets.inspect
  end

  private

  def default_format_json
    request.format = 'json'
  end
end
