module Utils
  extend ActiveSupport::Concern

  def prot2pept(prot)
    pattern = "([KR])([^P])"

    split(prot, pattern)
  end

  private
  def split(protein, pattern)
    protein.gsub(/#{pattern}/, "\\1\n\\2").gsub(/#{pattern}/, "\\1\n\\2").split("\n").reject(&:empty?)
  end
end

