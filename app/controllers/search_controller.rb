class SearchController < ApplicationController
  def single
    @title = "Tryptic Peptide Analysis"
  end

  def single_protein
    @title = "Protein Analysis"
  end
end
