class SequencesController < ApplicationController

  def show
    @sequence = Sequence.find(params[:id])
    @title = @sequence.sequence
  end
end