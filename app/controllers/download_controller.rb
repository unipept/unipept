class DownloadController < ApplicationController
  # sends the data variable back to the user
  def download
    data = params[:data]
    filename = params[:filename]
    filetype = params[:filetype] || 'text/plain'
    charset = params[:charset] || 'iso-8859-1'
    cookies['nonce'] = params[:nonce]
    response.headers['Set-Cookie'] = 'nonce=' + params[:nonce]
    send_data data, type: "#{filetype}; charset=#{charset}; header=present", disposition: 'attachment; filename=' + filename
  end
end
