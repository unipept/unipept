class PrideController < ApplicationController
  def load
     response = HTTParty.get("http://www.biomart.org/biomart/martservice?query=%3C?xml%20version=%221.0%22%20encoding=%22UTF-8%22?%3E%3C!DOCTYPE%20Query%3E%3CQuery%20virtualSchemaName%20=%20%22default%22%20formatter%20=%20%22HTML%22%20header%20=%20%220%22%20uniqueRows%20=%20%220%22%20count%20=%20%22%22%20datasetConfigVersion%20=%20%220.6%22%20%3E%3CDataset%20name%20=%20%22pride%22%20interface%20=%20%22default%22%20%3E%3CFilter%20name%20=%20%22experiment_ac%22%20value%20=%20%22#{params[:id]}%22/%3E%3CAttribute%20name%20=%20%22peptide_sequence%22%20/%3E%3C/Dataset%3E%3C/Query%3E")
     resp = response.body.lines.grep(/<td>/).join.gsub(/.*<td>(.*)<\/td>.*/,"\\1")
     render :plain => resp
  end
end