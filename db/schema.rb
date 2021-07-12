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

  create_table "dataset_items", id: :integer, unsigned: true, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8", force: :cascade do |t|
    t.integer "dataset_id", unsigned: true
    t.string "name", limit: 160
    t.text "data", limit: 16777215, null: false, collation: "ascii_general_ci"
    t.integer "order"
    t.index ["dataset_id"], name: "fk_dataset_items_datasets"
  end

  create_table "datasets", id: :integer, unsigned: true, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8", force: :cascade do |t|
    t.string "environment", limit: 160
    t.string "reference", limit: 500
    t.string "url", limit: 200
    t.string "project_website", limit: 200
  end

  create_table "ec_cross_references", id: :integer, unsigned: true, options: "ENGINE=InnoDB DEFAULT CHARSET=ascii", force: :cascade do |t|
    t.integer "uniprot_entry_id", null: false, unsigned: true
    t.string "ec_number_code", limit: 15, null: false
  end

  create_table "ec_numbers", id: :integer, limit: 2, unsigned: true, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8", force: :cascade do |t|
    t.string "code", limit: 15, null: false
    t.string "name", limit: 155, null: false
  end

  create_table "embl_cross_references", id: :integer, unsigned: true, options: "ENGINE=InnoDB DEFAULT CHARSET=ascii", force: :cascade do |t|
    t.integer "uniprot_entry_id", null: false, unsigned: true
    t.string "protein_id", limit: 25
    t.string "sequence_id", limit: 25
  end

  create_table "go_cross_references", id: :integer, unsigned: true, options: "ENGINE=InnoDB DEFAULT CHARSET=ascii", force: :cascade do |t|
    t.integer "uniprot_entry_id", null: false, unsigned: true
    t.string "go_term_code", limit: 15, null: false
  end

  create_table "go_terms", id: :integer, unsigned: true, options: "ENGINE=InnoDB DEFAULT CHARSET=latin1", force: :cascade do |t|
    t.string "code", limit: 15, null: false
    t.string "namespace", limit: 18, null: false
    t.string "name", limit: 200, null: false
  end

  create_table "interpro_cross_references", id: :integer, unsigned: true, options: "ENGINE=InnoDB DEFAULT CHARSET=ascii", force: :cascade do |t|
    t.integer "uniprot_entry_id", null: false, unsigned: true
    t.string "interpro_entry_code", limit: 9, null: false
  end

  create_table "interpro_entries", id: :integer, unsigned: true, options: "ENGINE=InnoDB DEFAULT CHARSET=ascii", force: :cascade do |t|
    t.string "code", limit: 9, null: false
    t.string "category", limit: 32, null: false
    t.string "name", limit: 160, null: false
  end

  create_table "lineages", primary_key: "taxon_id", id: :integer, limit: 3, unsigned: true, default: nil, options: "ENGINE=InnoDB DEFAULT CHARSET=ascii", force: :cascade do |t|
    t.integer "superkingdom", limit: 3
    t.integer "kingdom", limit: 3
    t.integer "subkingdom", limit: 3
    t.integer "superphylum", limit: 3
    t.integer "phylum", limit: 3
    t.integer "subphylum", limit: 3
    t.integer "superclass", limit: 3
    t.integer "class", limit: 3
    t.integer "subclass", limit: 3
    t.integer "superorder", limit: 3
    t.integer "order", limit: 3
    t.integer "suborder", limit: 3
    t.integer "infraorder", limit: 3
    t.integer "superfamily", limit: 3
    t.integer "family", limit: 3
    t.integer "subfamily", limit: 3
    t.integer "tribe", limit: 3
    t.integer "subtribe", limit: 3
    t.integer "genus", limit: 3
    t.integer "subgenus", limit: 3
    t.integer "species_group", limit: 3
    t.integer "species_subgroup", limit: 3
    t.integer "species", limit: 3
    t.integer "subspecies", limit: 3
    t.integer "strain", limit: 3
    t.integer "varietas", limit: 3
    t.integer "forma", limit: 3
  end

  create_table "peptides", id: :integer, unsigned: true, options: "ENGINE=InnoDB DEFAULT CHARSET=ascii", force: :cascade do |t|
    t.integer "sequence_id", null: false, unsigned: true
    t.integer "original_sequence_id", null: false, unsigned: true
    t.integer "uniprot_entry_id", null: false, unsigned: true
  end

  create_table "posts", id: :integer, unsigned: true, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8", force: :cascade do |t|
    t.string "title", limit: 100, null: false
    t.text "content", null: false
    t.date "date", null: false
  end

  create_table "proteome_caches", primary_key: "proteome_id", id: :integer, limit: 3, unsigned: true, default: nil, options: "ENGINE=InnoDB DEFAULT CHARSET=ascii", force: :cascade do |t|
    t.text "json_sequences", limit: 16777215, null: false
  end

  create_table "proteome_cross_references", id: :integer, unsigned: true, options: "ENGINE=InnoDB DEFAULT CHARSET=latin1", force: :cascade do |t|
    t.integer "uniprot_entry_id", null: false, unsigned: true
    t.integer "proteome_id", limit: 3, null: false, unsigned: true
  end

  create_table "proteomes", id: :integer, limit: 3, unsigned: true, default: nil, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8", force: :cascade do |t|
    t.string "proteome_accession_number", limit: 12, null: false
    t.string "proteome_name", limit: 145, null: false
    t.integer "taxon_id", limit: 3, unsigned: true
    t.binary "type_strain", limit: 1, default: 0b0, null: false
    t.binary "reference_proteome", limit: 1, default: 0b0, null: false
    t.string "strain", limit: 120
    t.string "assembly", limit: 45
    t.string "name", limit: 225
  end

  create_table "refseq_cross_references", id: :integer, unsigned: true, options: "ENGINE=InnoDB DEFAULT CHARSET=ascii", force: :cascade do |t|
    t.integer "uniprot_entry_id", null: false, unsigned: true
    t.string "protein_id", limit: 25
    t.string "sequence_id", limit: 25
  end

  create_table "sequences", id: :integer, unsigned: true, options: "ENGINE=InnoDB DEFAULT CHARSET=ascii ROW_FORMAT=COMPRESSED KEY_BLOCK_SIZE=16", force: :cascade do |t|
    t.string "sequence", limit: 50, null: false
    t.integer "lca", limit: 3, unsigned: true
    t.integer "lca_il", limit: 3, unsigned: true
    t.binary "fa", limit: 16777215
    t.binary "fa_il", limit: 16777215
  end

  create_table "taxons", id: :integer, limit: 3, unsigned: true, default: nil, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8", force: :cascade do |t|
    t.string "name", limit: 120, null: false
    t.string "rank", limit: 16
    t.integer "parent_id", limit: 3, unsigned: true
    t.binary "valid_taxon", limit: 1, default: 0b1, null: false
  end

  create_table "uniprot_entries", id: :integer, unsigned: true, options: "ENGINE=InnoDB DEFAULT CHARSET=ascii", force: :cascade do |t|
    t.string "uniprot_accession_number", limit: 10, null: false, collation: "latin1_swedish_ci"
    t.integer "version", limit: 2, null: false, unsigned: true
    t.integer "taxon_id", limit: 3, null: false, unsigned: true
    t.string "type", limit: 9, null: false
    t.string "name", limit: 150, null: false
    t.text "protein", null: false
  end

  create_table "users", id: :integer, options: "ENGINE=InnoDB DEFAULT CHARSET=latin1", force: :cascade do |t|
    t.string "username", limit: 8, null: false
    t.integer "admin", limit: 1, default: 0, null: false
  end

  add_foreign_key "dataset_items", "datasets", name: "fk_dataset_items_datasets"
end
