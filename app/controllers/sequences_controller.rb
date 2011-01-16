class SequencesController < ApplicationController

  def show
    @sequence = Sequence.find(params[:id])
  end
end