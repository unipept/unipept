# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 0) do

  create_table "counters", :primary_key => "name", :force => true do |t|
    t.integer "value", :default => 0, :null => false
  end

  create_table "dataset_items", :force => true do |t|
    t.integer "dataset_id"
    t.string  "name",       :limit => 160
    t.text    "data",       :limit => 16777215, :null => false
    t.integer "order"
  end

  add_index "dataset_items", ["dataset_id"], :name => "fk_dataset_items_datasets"

  create_table "datasets", :force => true do |t|
    t.string "environment",     :limit => 160
    t.string "reference",       :limit => 500
    t.string "url",             :limit => 200
    t.string "project_website", :limit => 200
  end

  create_table "embl_cross_references", :force => true do |t|
    t.integer "uniprot_entry_id",               :null => false
    t.string  "protein_id",       :limit => 15
    t.string  "sequence_id",      :limit => 15
  end

  add_index "embl_cross_references", ["uniprot_entry_id"], :name => "fk_uniprot_cross_reference_uniprot_entries"

  create_table "genomes", :force => true do |t|
    t.string  "name",          :limit => 120, :null => false
    t.integer "bioproject_id",                :null => false
    t.string  "refseq_id",     :limit => 15,  :null => false
    t.string  "status",        :limit => 45,  :null => false
  end

  add_index "genomes", ["refseq_id"], :name => "idx_refseq_id"

  create_table "lineages", :primary_key => "taxon_id", :force => true do |t|
    t.integer "superkingdom",     :limit => 3
    t.integer "kingdom",          :limit => 3
    t.integer "subkingdom",       :limit => 3
    t.integer "superphylum",      :limit => 3
    t.integer "phylum",           :limit => 3
    t.integer "subphylum",        :limit => 3
    t.integer "superclass",       :limit => 3
    t.integer "class",            :limit => 3
    t.integer "subclass",         :limit => 3
    t.integer "infraclass",       :limit => 3
    t.integer "superorder",       :limit => 3
    t.integer "order",            :limit => 3
    t.integer "suborder",         :limit => 3
    t.integer "infraorder",       :limit => 3
    t.integer "parvorder",        :limit => 3
    t.integer "superfamily",      :limit => 3
    t.integer "family",           :limit => 3
    t.integer "subfamily",        :limit => 3
    t.integer "tribe",            :limit => 3
    t.integer "subtribe",         :limit => 3
    t.integer "genus",            :limit => 3
    t.integer "subgenus",         :limit => 3
    t.integer "species_group",    :limit => 3
    t.integer "species_subgroup", :limit => 3
    t.integer "species",          :limit => 3
    t.integer "subspecies",       :limit => 3
    t.integer "varietas",         :limit => 3
    t.integer "forma",            :limit => 3
  end

  add_index "lineages", ["taxon_id"], :name => "fk_lineages_taxons"

  create_table "peptides", :force => true do |t|
    t.integer "sequence_id",                       :null => false
    t.integer "original_sequence_id",              :null => false
    t.integer "uniprot_entry_id",                  :null => false
    t.integer "position",             :limit => 2, :null => false
  end

  add_index "peptides", ["original_sequence_id"], :name => "fk_peptides_original_sequences"
  add_index "peptides", ["sequence_id"], :name => "fk_peptides_sequences"
  add_index "peptides", ["uniprot_entry_id"], :name => "fk_peptides_uniprot_entries"

  create_table "posts", :force => true do |t|
    t.string "title",   :limit => 100, :null => false
    t.text   "content",                :null => false
    t.date   "date",                   :null => false
  end

  create_table "refseq_cross_references", :force => true do |t|
    t.integer "uniprot_entry_id",               :null => false
    t.string  "protein_id",       :limit => 15
    t.string  "sequence_id",      :limit => 15
  end

  add_index "refseq_cross_references", ["sequence_id"], :name => "idx_sequence_id"
  add_index "refseq_cross_references", ["uniprot_entry_id"], :name => "fk_refseq_reference_uniprot_entries"

  create_table "sequences", :force => true do |t|
    t.string  "sequence", :limit => 50, :null => false
    t.integer "lca",      :limit => 3
    t.integer "lca_il",   :limit => 3
  end

  add_index "sequences", ["lca"], :name => "fk_sequences_taxons"
  add_index "sequences", ["lca_il"], :name => "fk_sequences_taxons_2"
  add_index "sequences", ["sequence"], :name => "uidx_sequence", :unique => true

  create_table "taxons", :force => true do |t|
    t.string  "name",        :limit => 256,                   :null => false
    t.string  "rank",        :limit => 16
    t.integer "parent_id",   :limit => 3
    t.boolean "valid_taxon",                :default => true, :null => false
  end

  add_index "taxons", ["parent_id"], :name => "fk_taxon_taxon"

  create_table "uniprot_entries", :force => true do |t|
    t.string  "uniprot_accession_number", :limit => 8, :null => false
    t.integer "version",                  :limit => 2, :null => false
    t.integer "taxon_id",                 :limit => 3, :null => false
    t.string  "type",                     :limit => 9, :null => false
    t.text    "protein",                               :null => false
  end

  add_index "uniprot_entries", ["taxon_id"], :name => "fk_uniprot_entries_taxons"

end
