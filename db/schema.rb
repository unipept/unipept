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
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 0) do

  create_table "assemblies", force: :cascade do |t|
    t.string  "genbank_assembly_accession", limit: 16
    t.string  "refseq_assembly_accession",  limit: 16
    t.integer "taxon_id",                   limit: 3
    t.string  "genome_representation",      limit: 7,                    null: false
    t.string  "assembly_level",             limit: 20,                   null: false
    t.string  "assembly_name",              limit: 104,                  null: false
    t.string  "organism_name",              limit: 86,                   null: false
    t.string  "biosample",                  limit: 14
    t.binary  "type_strain",                limit: 1,   default: 0b0, null: false
  end

  add_index "assemblies", ["taxon_id"], name: "fk_taxons_assemblies_idx", using: :btree

  create_table "assembly_caches", primary_key: "assembly_id", force: :cascade do |t|
    t.text "json_sequences", limit: 16777215, null: false
  end

  create_table "assembly_sequences", force: :cascade do |t|
    t.integer "assembly_id",       limit: 4,                 null: false
    t.string  "sequence_type",     limit: 13, default: "na", null: false
    t.string  "genbank_accession", limit: 25,                null: false
  end

  add_index "assembly_sequences", ["assembly_id"], name: "fk_assemblies_assembly_sequences_idx", using: :btree
  add_index "assembly_sequences", ["genbank_accession"], name: "idx_genbank_accession", using: :btree

  create_table "dataset_items", force: :cascade do |t|
    t.integer "dataset_id", limit: 4
    t.string  "name",       limit: 160
    t.text    "data",       limit: 16777215, null: false
    t.integer "order",      limit: 4
  end

  add_index "dataset_items", ["dataset_id"], name: "fk_dataset_items_datasets", using: :btree

  create_table "datasets", force: :cascade do |t|
    t.string "environment",     limit: 160
    t.string "reference",       limit: 500
    t.string "url",             limit: 200
    t.string "project_website", limit: 200
  end

  create_table "ec_cross_references", force: :cascade do |t|
    t.integer "uniprot_entry_id", limit: 4,  null: false
    t.string  "ec_id",            limit: 12, null: false
  end

  add_index "ec_cross_references", ["uniprot_entry_id"], name: "fk_ec_reference_uniprot_entries", using: :btree

  create_table "ec_numbers", force: :cascade do |t|
    t.string "number", limit: 12,  null: false
    t.string "name",   limit: 160, null: false
  end

  add_index "ec_numbers", ["number"], name: "idx_number", using: :btree

  create_table "embl_cross_references", force: :cascade do |t|
    t.integer "uniprot_entry_id", limit: 4,  null: false
    t.string  "protein_id",       limit: 25
    t.string  "sequence_id",      limit: 25
  end

  add_index "embl_cross_references", ["sequence_id"], name: "idx_sequence_id", using: :btree
  add_index "embl_cross_references", ["uniprot_entry_id"], name: "fk_embl_reference_uniprot_entries", using: :btree

  create_table "go_cross_references", force: :cascade do |t|
    t.integer "uniprot_entry_id", limit: 4,  null: false
    t.string  "go_id",            limit: 12, null: false
  end

  add_index "go_cross_references", ["uniprot_entry_id"], name: "fk_go_reference_uniprot_entries", using: :btree

  create_table "kegg_pathway_mappings", force: :cascade do |t|
    t.integer "ec_number_id",    limit: 3, null: false
    t.integer "kegg_pathway_id", limit: 4, null: false
  end

  create_table "kegg_pathways", force: :cascade do |t|
    t.string "long_id", limit: 12,  null: false
    t.string "name",    limit: 128, null: false
  end

  create_table "lineages", primary_key: "taxon_id", force: :cascade do |t|
    t.integer "superkingdom",     limit: 3
    t.integer "kingdom",          limit: 3
    t.integer "subkingdom",       limit: 3
    t.integer "superphylum",      limit: 3
    t.integer "phylum",           limit: 3
    t.integer "subphylum",        limit: 3
    t.integer "superclass",       limit: 3
    t.integer "class",            limit: 3
    t.integer "subclass",         limit: 3
    t.integer "infraclass",       limit: 3
    t.integer "superorder",       limit: 3
    t.integer "order",            limit: 3
    t.integer "suborder",         limit: 3
    t.integer "infraorder",       limit: 3
    t.integer "parvorder",        limit: 3
    t.integer "superfamily",      limit: 3
    t.integer "family",           limit: 3
    t.integer "subfamily",        limit: 3
    t.integer "tribe",            limit: 3
    t.integer "subtribe",         limit: 3
    t.integer "genus",            limit: 3
    t.integer "subgenus",         limit: 3
    t.integer "species_group",    limit: 3
    t.integer "species_subgroup", limit: 3
    t.integer "species",          limit: 3
    t.integer "subspecies",       limit: 3
    t.integer "varietas",         limit: 3
    t.integer "forma",            limit: 3
  end

  add_index "lineages", ["species"], name: "idx_species", using: :btree

  create_table "peptides", force: :cascade do |t|
    t.integer "sequence_id",          limit: 4, null: false
    t.integer "original_sequence_id", limit: 4, null: false
    t.integer "uniprot_entry_id",     limit: 4, null: false
    t.integer "position",             limit: 2, null: false
  end

  add_index "peptides", ["original_sequence_id"], name: "fk_peptides_original_sequences", using: :btree
  add_index "peptides", ["sequence_id"], name: "fk_peptides_sequences", using: :btree
  add_index "peptides", ["uniprot_entry_id"], name: "fk_peptides_uniprot_entries", using: :btree

  create_table "posts", force: :cascade do |t|
    t.string "title",   limit: 100,   null: false
    t.text   "content", limit: 65535, null: false
    t.date   "date",                  null: false
  end

  create_table "refseq_cross_references", force: :cascade do |t|
    t.integer "uniprot_entry_id", limit: 4,  null: false
    t.string  "protein_id",       limit: 25
    t.string  "sequence_id",      limit: 25
  end

  add_index "refseq_cross_references", ["uniprot_entry_id"], name: "fk_refseq_reference_uniprot_entries", using: :btree

  create_table "sequences", force: :cascade do |t|
    t.string  "sequence", limit: 50, null: false
    t.integer "lca",      limit: 3
    t.integer "lca_il",   limit: 3
  end

  add_index "sequences", ["lca"], name: "fk_sequences_taxons", using: :btree
  add_index "sequences", ["lca_il"], name: "fk_sequences_taxons_2", using: :btree
  add_index "sequences", ["sequence"], name: "idx_sequences", unique: true, using: :btree

  create_table "taxons", force: :cascade do |t|
    t.string  "name",        limit: 120,                  null: false
    t.string  "rank",        limit: 16
    t.integer "parent_id",   limit: 3
    t.binary  "valid_taxon", limit: 1,   default: 0b1, null: false
  end

  add_index "taxons", ["parent_id"], name: "fk_taxon_taxon", using: :btree

  create_table "uniprot_entries", force: :cascade do |t|
    t.string  "uniprot_accession_number", limit: 10,    null: false
    t.integer "version",                  limit: 2,     null: false
    t.integer "taxon_id",                 limit: 3,     null: false
    t.string  "type",                     limit: 9,     null: false
    t.string  "name",                     limit: 150,   null: false
    t.text    "protein",                  limit: 65535, null: false
  end

  add_index "uniprot_entries", ["taxon_id"], name: "fk_uniprot_entries_taxons", using: :btree

  create_table "users", force: :cascade do |t|
    t.string  "username", limit: 8,             null: false
    t.integer "admin",    limit: 1, default: 0, null: false
  end

  add_foreign_key "dataset_items", "datasets", name: "fk_dataset_items_datasets"
end
