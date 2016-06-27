# == Schema Information
#
# Table name: ec_numbers
#
#  id   :integer          not null, primary key
#  code :string(15)       not null
#  name :string(140)      not null
#

class EcNumber < ActiveRecord::Base
  include ReadOnlyModel

  EC_COLUMN_TITLE = ["EC number", "Class", "Subclass", "Sub-subclass", "Enzyme"]

  def self.get_ontology(ec)
  	lineage_list = []
  	mem = ""
  	count = 3
    if ec.nil?
      return lineage_list
    end
  	ec.split(".").each do |ec_rank|
  	  if ec_rank != "-"
  		  lineage_list.append(mem+ec_rank+".-"*count)
  	  else
  	  	return lineage_list
  	  end
  	  mem += ec_rank+"."
  	  count -= 1
  	end
  	return lineage_list
  end

  def self.count_ontology(ec_self_count)
  	count_dic = {}
  	ec_self_count.each do |key, val|
  	  ontology = self.get_ontology(key)
  	  ontology.each do |ec|
	  	  count_dic[ec] = count_dic.has_key?(ec) ? count_dic[ec]+val : val
	    end
  	end
  	return count_dic
  end

  def self.get_ec_function(ec_ontology, ecnumber_db)
    ec_ontology_functions = {}
    # get all functions
    tmp_ec_ontology_functions = ecnumber_db.select("code, name").where(code: ec_ontology)
    # put functions in hash
    tmp_ec_ontology_functions.each do |ec_func|
      ec_ontology_functions[ec_func[:code]] = ec_func[:name]
    end
    return ec_ontology_functions
  end
  
  def self.calc_ec_lca(ec_hash, ec_root)
    if ec_hash["children"].nil? or ec_hash["children"].size > 1 or ec_hash["children"] == []
      return ec_root
    end
    ec_root = ec_hash["children"][0]["id"]
    calc_ec_lca(ec_hash["children"][0], ec_root)
  end
end
