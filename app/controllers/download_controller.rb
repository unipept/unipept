class DownloadController < ApplicationController

  # sends the data variable back to the user
  def download
    data = params[:data]
    filename = params[:filename]
    cookies['nonce'] = params[:nonce]
    response.headers["Set-Cookie"] = "nonce=" + params[:nonce]
    send_data data, :type => 'text/plain; charset=iso-8859-1; header=present', :disposition => "attachment; filename="+filename
  end

end