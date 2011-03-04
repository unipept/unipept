class CreateLineages < ActiveRecord::Migration
  def self.up
    create_table :lineages do |t|

      t.timestamps
    end
  end

  def self.down
    drop_table :lineages
  end
end
