class DatasetItemsController < ApplicationController

  def show
    item = DatasetItem.find(params[:id])
    render :html => item.data
  end
end