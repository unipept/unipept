class CreateDatasetItems < ActiveRecord::Migration
  def self.up
    create_table :dataset_items do |t|
      t.string :name
      t.string :path
      t.integer :order
      t.integer :dataset_id

      t.timestamps
    end
  end

  def self.down
    drop_table :dataset_items
  end
end
