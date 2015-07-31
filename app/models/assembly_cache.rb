# == Schema Information
#
# Table name: assembly_caches
#
#  assembly_id    :integer          not null, primary key
#  json_sequences :text(16777215)   not null
#

class AssemblyCache < ActiveRecord::Base
  attr_accessible :assembly_id, :json_sequences

  validates :json_sequences, presence: true,
                             length: { maximum: 16_777_215 }

  # Tries to retrieve the the cached version of the peptides list
  # and creates it if it doesn't exist
  def self.get_by_assembly_id(assembly_id)
    cache = AssemblyCache.find_by_assembly_id(assembly_id)
    if cache.nil?
      result_set = Set.new
      AssemblySequence.where(assembly_id: assembly_id).find_each do |assembly_sequence|
        result_set.merge(EmblCrossReference.get_sequence_ids(assembly_sequence.genbank_accession))
      end
      json = Oj.dump(result_set.to_a.sort!, mode: :compat)
      cache = AssemblyCache.create(assembly_id: assembly_id, json_sequences: json)
    end
    cache
  end
end
