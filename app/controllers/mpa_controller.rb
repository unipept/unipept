class MpaController < ApplicationController
  def analyze
    @header_class = 'MPA'
    @peptides = (params[:peptides] || '').lines.to_json
  end
end
