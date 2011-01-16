class CreatePeptides < ActiveRecord::Migration
  def self.up
    create_table :peptides do |t|
      t.integer :sequence_id
      t.integer :organism_id
      t.integer :position

      t.timestamps
    end
  end

  def self.down
    drop_table :peptides
  end
end
