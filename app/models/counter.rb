# == Schema Information
#
# Table name: counters
#
#  name  :string(31)      not null, primary key
#  value :integer(4)      default(0), not null
#

class Counter < ActiveRecord::Base
  
  set_primary_key :name
  
  def self.count(max=1000, equate_il=true)
    id = Counter.find_by_name("sequence_id")
    while id.value < max
      if id.value % 1000000 == 0
        File.open("public/progress", 'w') { |file| file.write("Counter#" + ActionController::Base.helpers.number_with_precision((id.value * 100.0 / max), :precision => 2) ) }
      end
      id.value += 1
      sequence = Sequence.find_by_id(id.value)
      if !sequence.nil?
        lca = sequence.calculate_lca(equate_il)
        unless lca.nil?
          lca_taxon = Taxon.find_by_id(lca)
          c = lca_taxon.name == "root" ? Counter.find_by_name("root") : Counter.find_by_name(lca_taxon.rank);
          if !c.nil?
            c.value += 1
            c.save;
          end
        end
      end
      id.save;
    end
  end
  
end
