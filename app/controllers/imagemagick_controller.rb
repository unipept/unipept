class ImagemagickController < ApplicationController

  # converts an svg to a png
  def convert
    i = params[:image].sub("'Helvetica Neue'", "Helvetica Neue")
    img = Magick::Image.from_blob(i){ self.density = '144.0x144.0'; self.format = 'SVG'; }.first
    img.format = "png"
    image = Base64.encode64(img.to_blob);
    render :body => "data:image/png;base64,#{image}"
  end

end