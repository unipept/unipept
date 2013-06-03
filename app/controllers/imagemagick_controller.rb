class ImagemagickController < ApplicationController
  require 'RMagick'
  
  # converts an svg to a png
  def convert
    img = Magick::Image.from_blob(params[:image]){ self.density = '144.0x144.0'; self.format = 'SVG'; }.first
    img.format = "png"
    image = Base64.encode64(img.to_blob);
    render :text => "data:image/png;base64,#{image}"
  end
  
end