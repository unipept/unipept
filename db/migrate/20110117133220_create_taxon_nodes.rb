class CreateTaxonNodes < ActiveRecord::Migration
  def self.up
    create_table :taxon_nodes do |t|
      t.integer :tax_id
      t.integer :parentTax_id
      t.string :rank
      t.integer :geneticCode
      t.integer :mitoCode
      t.boolean :isTaxonHidden

      t.timestamps
    end
  end

  def self.down
    drop_table :taxon_nodes
  end
end
