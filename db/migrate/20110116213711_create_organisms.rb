class CreateOrganisms < ActiveRecord::Migration
  def self.up
    create_table :organisms do |t|
      t.string :name
      t.integer :taxon_id
      t.integer :species_id
      t.integer :genus_id

      t.timestamps
    end
  end

  def self.down
    drop_table :organisms
  end
end
