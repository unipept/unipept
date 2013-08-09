# == Schema Information
#
# Table name: ec_numbers
#
#  id     :integer          not null, primary key
#  number :string(12)       not null
#  name   :string(160)      not null
#

class EcNumber < ActiveRecord::Base
  has_many :kegg_pathway_mappings

  def self.fetch_kegg_data
    EcNumber.all.each do |ec|
      response = HTTParty.get("http://www.genome.jp/dbget-bin/get_linkdb?-t+pathway+ec:#{ec.number}").body
      for line in response.lines do
        if line.include? "kegg-bin/show_pathway"
          pathway = line.gsub(/^.*">(.*)<\/a>.*$/, '\1').strip
          KeggPathwayMapping.create(:ec_number_id => ec.id, :kegg_pathway_id => pathway)
        end
      end
    end
  end
end
