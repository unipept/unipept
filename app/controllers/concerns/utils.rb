module Utils
  extend ActiveSupport::Concern

  require 'HTTParty'

  def prot2pept(prot)
    pattern = "([KR])([^P])"

    split(prot, pattern)
  end

  def lca_star(taxon_ids)
    resp = HTTParty.get('http://localhost:5000', :query => {:ids => taxon_ids})

    resp.parsed_response
  end

  private
  def split(protein, pattern)
    protein.gsub(/#{pattern}/, "\\1\n\\2").gsub(/#{pattern}/, "\\1\n\\2").split("\n").reject(&:empty?)
  end
end

