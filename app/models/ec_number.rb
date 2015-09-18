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
          pathway_name = line.gsub(/^.*<\/a>   *([^ ].*)$/, '\1').strip
          kp = KeggPathway.find_or_create_by_long_id_and_name(pathway, pathway_name)
          KeggPathwayMapping.create(:ec_number_id => ec.id, :kegg_pathway_id => kp.id)
        end
      end
    end
  end
end
