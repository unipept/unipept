# == Schema Information
#
# Table name: ec_numbers
#
#  id        :integer          not null, primary key
#  ec_number :string(15)       not null
#  name      :string(140)      not null
#

class EcNumber < ActiveRecord::Base
  include ReadOnlyModel
  attr_accessible nil

  has_many :ec_cross_references
  has_many :kegg_pathway_mappings

  def self.get_ontology(ec)
  	lineage_list = []
  	mem = ""
  	count = 3
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
    tmp_ec_ontology_functions = ecnumber_db.select("ec_number, name").where(ec_number: ec_ontology)
    # put functions in hash
    tmp_ec_ontology_functions.each do |ec_func|
      ec_ontology_functions[ec_func[:ec_number]] = ec_func[:name]
    end
    return ec_ontology_functions
  end
  
  def self.calc_ec_lca(ec_hash, ec_root, common_ec_lineage)
    if ec_hash["children"].nil? or ec_hash["children"].size > 1 or ec_hash["children"] == []
      return ec_root, common_ec_lineage
    end
    ec_root = ec_hash["children"][0]["id"]
    common_ec_lineage.push(ec_root)
    calc_ec_lca(ec_hash["children"][0], ec_root, common_ec_lineage)
  end
end
