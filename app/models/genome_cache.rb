# == Schema Information
#
# Table name: genome_caches
#
#  bioproject_id  :integer(4)      not null, primary key
#  json_sequences :text(16777215)  default(""), not null
#

class GenomeCache < ActiveRecord::Base
  attr_accessible :bioproject_id, :json_sequences

  # Tries to retrieve the the cached version of the peptides list
  # and creates it if it doesn't exist
  def self.get_by_bioproject_id(bioproject_id)
    cache = GenomeCache.find_by_bioproject_id(bioproject_id)
    if cache.nil?
      result_set = Set.new
      Genome.find_all_by_bioproject_id(bioproject_id).each do |genome|
        result_set.merge(EmblCrossReference.get_sequence_ids(genome.insdc_id))
      end
      json = Oj.dump(result_set.to_a.sort!, mode: :compat)
      cache = GenomeCache.create(bioproject_id: bioproject_id, json_sequences: json)
    end
    return cache
  end
end
