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
    t.integer "ec_number_id",     limit: 2,  null: false
    t.string  "ec_number",        limit: 15, null: false
  end

  add_index "ec_cross_references", ["ec_number_id"], name: "fk_ec_reference_ec_numbers", using: :btree
  add_index "ec_cross_references", ["uniprot_entry_id"], name: "fk_ec_reference_uniprot_entries", using: :btree

  create_table "ec_numbers", force: :cascade do |t|
    t.string "ec_number", limit: 15,  null: false
    t.string "name",      limit: 140, null: false
  end

  create_table "embl_cross_references", force: :cascade do |t|
    t.integer "uniprot_entry_id", limit: 4,  null: false
    t.string  "protein_id",       limit: 25
    t.string  "sequence_id",      limit: 25
  end

  add_index "embl_cross_references", ["sequence_id"], name: "idx_sequence_id", using: :btree
  add_index "embl_cross_references", ["uniprot_entry_id"], name: "fk_embl_reference_uniprot_entries", using: :btree

  create_table "go_cross_references", force: :cascade do |t|
    t.integer "uniprot_entry_id", limit: 4,  null: false
    t.integer "go_term_id",       limit: 2,  null: false
    t.string  "go_id",            limit: 15, null: false
  end

  add_index "go_cross_references", ["go_term_id"], name: "fk_go_reference_go_terms", using: :btree
  add_index "go_cross_references", ["uniprot_entry_id"], name: "fk_go_reference_uniprot_entries", using: :btree

  create_table "go_lcas", force: :cascade do |t|
    t.integer "sequence_id", limit: 4, null: false
    t.integer "go_lca",      limit: 2
    t.integer "go_lca_il",   limit: 2
  end

  add_index "go_lcas", ["go_lca"], name: "fk_go_lcas_go_terms", using: :btree
  add_index "go_lcas", ["go_lca_il"], name: "fk_go_lcas_go_terms_2", using: :btree
  add_index "go_lcas", ["sequence_id"], name: "fk_go_lcas_sequences", using: :btree

  create_table "go_terms", force: :cascade do |t|
    t.string "go_id",      limit: 15,  null: false
    t.string "name",       limit: 200, null: false
    t.string "name_space", limit: 2,   null: false
  end

  create_table "interpro_cross_references", force: :cascade do |t|
    t.integer "uniprot_entry_id",  limit: 4,  null: false
    t.integer "interpro_entry_id", limit: 2,  null: false
    t.string  "interpro_id",       limit: 15, null: false
  end

  add_index "interpro_cross_references", ["interpro_entry_id"], name: "fk_interpro_reference_interpro_entries", using: :btree
  add_index "interpro_cross_references", ["uniprot_entry_id"], name: "fk_interpro_reference_uniprot_entries", using: :btree

  create_table "interpro_entries", force: :cascade do |t|
    t.integer "parent_id",   limit: 2,  null: false
    t.string  "interpro_id", limit: 15, null: false
    t.string  "name",        limit: 40, null: false
    t.string  "type",        limit: 3
  end

  create_table "interpro_to_gos", force: :cascade do |t|
    t.integer "interpro_entry_id", limit: 2, null: false
    t.integer "go_term_id",        limit: 2, null: false
  end

  add_index "interpro_to_gos", ["go_term_id"], name: "fk_interpro_entries_has_go_terms_go_terms", using: :btree
  add_index "interpro_to_gos", ["interpro_entry_id"], name: "fk_interpro_entries_has_go_terms_interpro_entries", using: :btree

  create_table "kegg_pathway_mappings", force: :cascade do |t|
    t.integer "ec_number_id",    limit: 2, null: false
    t.integer "kegg_pathway_id", limit: 2, null: false
  end

  add_index "kegg_pathway_mappings", ["ec_number_id"], name: "fk_ec_numbers", using: :btree
  add_index "kegg_pathway_mappings", ["kegg_pathway_id"], name: "fk_kegg_pathways", using: :btree

  create_table "kegg_pathways", force: :cascade do |t|
    t.string "long_id", limit: 12, null: false
    t.string "name",    limit: 90, null: false
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
  end

  add_index "peptides", ["original_sequence_id"], name: "fk_peptides_original_sequences", using: :btree
  add_index "peptides", ["sequence_id"], name: "fk_peptides_sequences", using: :btree
  add_index "peptides", ["uniprot_entry_id"], name: "fk_peptides_uniprot_entries", using: :btree

  create_table "posts", force: :cascade do |t|
    t.string "title",   limit: 100,   null: false
    t.text   "content", limit: 65535, null: false
    t.date   "date",                  null: false
  end

  create_table "proteome_caches", primary_key: "proteome_id", force: :cascade do |t|
    t.text "json_sequences", limit: 16777215, null: false
  end

  create_table "proteome_cross_references", force: :cascade do |t|
    t.integer "uniprot_entry_id", limit: 4, null: false
    t.integer "proteome_id",      limit: 3, null: false
  end

  add_index "proteome_cross_references", ["proteome_id"], name: "fk_proteome_cross_references", using: :btree
  add_index "proteome_cross_references", ["uniprot_entry_id"], name: "fk_proteome_cross_references_uniprot_entries", using: :btree

  create_table "taxons", force: :cascade do |t|
    t.string  "name",        limit: 120,                  null: false
    t.string  "rank",        limit: 16
    t.integer "parent_id",   limit: 3
    t.binary  "valid_taxon", limit: 1,   default: 0b1, null: false
  end

  add_index "taxons", ["parent_id"], name: "fk_taxon_taxon", using: :btree

  create_table "proteomes", force: :cascade do |t|
    t.string  "proteome_accession_number", limit: 12,                   null: false
    t.string  "proteome_name",             limit: 100,                  null: false
    t.integer "taxon_id",                  limit: 3
    t.binary  "type_strain",               limit: 1,   default: 0b0, null: false
    t.binary  "reference_proteome",        limit: 1,   default: 0b0, null: false
    t.string  "strain",                    limit: 45
    t.string  "assembly",                  limit: 45
    t.string  "name",                      limit: 128
  end

  add_index "proteomes", ["taxon_id"], name: "fk_taxons_proteomes", using: :btree

  create_table "refseq_cross_references", force: :cascade do |t|
    t.integer "uniprot_entry_id", limit: 4,  null: false
    t.string  "protein_id",       limit: 25
    t.string  "sequence_id",      limit: 25
  end

  add_index "refseq_cross_references", ["uniprot_entry_id"], name: "fk_refseq_reference_uniprot_entries", using: :btree

  create_table "sequences", force: :cascade do |t|
    t.string  "sequence",  limit: 50, null: false
    t.integer "lca",       limit: 3
    t.integer "lca_il",    limit: 3
    t.integer "ec_lca",    limit: 2
    t.integer "ec_lca_il", limit: 2
  end

  add_index "sequences", ["ec_lca"], name: "fk_sequences_ec_numbers", using: :btree
  add_index "sequences", ["ec_lca_il"], name: "fk_sequences_ec_numbers_2", using: :btree
  add_index "sequences", ["lca"], name: "fk_sequences_taxons", using: :btree
  add_index "sequences", ["lca_il"], name: "fk_sequences_taxons_2", using: :btree
  add_index "sequences", ["sequence"], name: "idx_sequences", unique: true, using: :btree

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
