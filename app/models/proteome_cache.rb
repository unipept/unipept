# == Schema Information
#
# Table name: proteome_caches
#
#  proteome_id    :integer          not null, primary key
#  json_sequences :text(16777215)   not null
#

class ProteomeCache < ActiveRecord::Base
  attr_accessible :proteome_id, :json_sequences

  validates :json_sequences, presence: true,
                             length: { maximum: 16_777_215 }

  # Tries to retrieve the the cached version of the peptides list
  # and creates it if it doesn't exist
  def self.get_by_proteome_id(proteome_id)
    cache = ProteomeCache.find_by_proteome_id(proteome_id)
    if cache.nil?
      result = ProteomeCrossReference.get_sequence_ids(proteome_id)
      json = Oj.dump(result.sort!, mode: :compat)
      cache = ProteomeCache.create(proteome_id: proteome_id, json_sequences: json)
    end
    cache
  end
end
