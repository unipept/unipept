class CreateTaxonNames < ActiveRecord::Migration
  def self.up
    create_table :taxon_names do |t|
      t.integer :tax_id
      t.string :name
      t.string :nameClass

      t.timestamps
    end
  end

  def self.down
    drop_table :taxon_names
  end
end
