# == Schema Information
#
# Table name: assembly_caches
#
#  assembly_id    :integer          not null, primary key
#  json_sequences :text(16777215)   not null
#

class AssemblyCache < ActiveRecord::Base
  attr_accessible :bioproject_id, :json_sequences

  validates :json_sequences, :presence => true,
                             :length => { :maximum => 16777215 }

  # TODO
  # Tries to retrieve the the cached version of the peptides list
  # and creates it if it doesn't exist
  def self.get_by_bioproject_id(bioproject_id)
    cache = GenomeCache.find_by_bioproject_id(bioproject_id)
    if cache.nil?
      result_set = Set.new
      Genome.where(bioproject_id: bioproject_id).each do |genome|
        result_set.merge(EmblCrossReference.get_sequence_ids(genome.insdc_id))
      end
      json = Oj.dump(result_set.to_a.sort!, mode: :compat)
      cache = GenomeCache.create(bioproject_id: bioproject_id, json_sequences: json)
    end
    return cache
  end
end
