#!/bin/env ruby

# Creates the kmer-EC index
# Has linear time complexity, but also uses space linear to the size of the
# amount of protein sequences. Will need 400GiB+ RAM for the whole UniProtKB
# database. Use the makefile and java unipept tools if your memory is limited.

require 'set'

K = ARGV[0].to_i
EC_ID_FILE = ARGV[1]
EC_CROSREF_FILE = ARGV[2]
UNIPROT_FILE = ARGV[3]

STDERR.puts "Creating {EC number => EC id} hash"
ec_id = Hash.new
File.open(EC_ID_FILE)
  .each_line
  .map{ |line| line.strip.split("\t") }
  .each do |id, ec_number, _ec_desciption|
  ec_id[ec_number] = id.to_i
end


STDERR.puts "Creating {sequence => EC number} hash"
seq_ecs = Hash.new{ |hash, k| hash[k] = Set.new }
File.open(EC_CROSREF_FILE)
  .each_line
  .map{ |line| line.strip.split("\t") }
  .each do |_, uniprot_id, ec_number|
  seq_ecs[uniprot_id.to_i].add ec_id[ec_number]
end


STDERR.puts "Creating {kmer => EC number} hash"
kmer_ecs = Hash.new{ |hash, k| hash[k] = []  }
i = 0
File.read(UNIPROT_FILE)
  .lines
  .map{ |line| line.strip.split("\t") }
  .each do |id, _uniprot_id,  _version, _taxon, _type, _name, sequence|
  i += 1
  STDERR.puts "Progress: #{i}" if i % 10000 == 0

  ecs = seq_ecs[id.to_i].to_a
  next if ecs.empty?

  (sequence.length - K + 1).times.map{|s| sequence[s..(s+K-1)]}.each do |kmer|
    kmer_ecs[kmer].concat(ecs)
    kmer_ecs[kmer].uniq!
  end
end

STDERR.puts "Writing 'kmer_ecs.tsv'"
kmer_count = kmer_ecs.size
i = 0
kmer_ecs.each do |kmer, ecs|
  if ecs.size > 0
    puts "#{kmer}\t#{ecs.join(',')}"
  end
  i += 1
  if i % 1000000 == 0
    STDERR.puts "Progress: #{(i * 100)/kmer_count}%"
  end
end

