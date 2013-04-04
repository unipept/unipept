class DatasetItemsController < ApplicationController
  
  def show
    item = DatasetItem.find(params[:id])    
    render :text => item.data
  end
end