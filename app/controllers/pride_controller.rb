class PrideController < ApplicationController
  def load
     response = HTTParty.get("http://www.ebi.ac.uk:80/pride/ws/archive/peptide/list/assay/#{params[:id]}?show=9999999&page=0")
     resp = JSON.parse(response.body)["list"].map{|e| e["sequence"]}.join("\n")
     render :plain => resp
  end
end