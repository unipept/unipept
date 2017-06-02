# == Schema Information
#
# Table name: ec_numbers
#
#  id   :integer          not null, primary key
#  code :string(15)       not null
#  name :string(140)      not null
#

class EcNumber < ApplicationRecord
  	include ReadOnlyModel

	EC_COLUMN_TITLE = ["EC number", "Class", "Subclass", "Sub-subclass", "Enzyme"]

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

	def self.get_ec_function(ec_ontology, ec_functions, ecnumber_db)
		# get all functions
		tmp_ec_ontology_functions = ecnumber_db.select("code, name").where(code: ec_ontology)
		# add functions in hash
		tmp_ec_ontology_functions.each do |ec_func|
			ec_functions[ec_func[:code]] = ec_func[:name]
		end
		return ec_functions
	end

  	def self.get_consensus(ec_root, ec_consensus=['root'])
    	if ec_root[:children].nil? or ec_root[:children].size > 1 or ec_root[:children] == []
      		return ec_consensus
    	end
    	ec_consensus.push(ec_root[:children][0][:id])
    	get_consensus(ec_root[:children][0], ec_consensus)
  	end
end
