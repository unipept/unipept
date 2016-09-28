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

	def self.get_lca(ec_list)
		pos, mem = 0, ''
		while pos < 4
			level = ec_list.map{|ec| ec.split('.')[pos]}.uniq
			if level.size > 1
				return pos == 0 ? '-.-.-.-' : mem+'.-'*(4-pos)
			end
			mem = mem == '' ? level[0] : mem+'.'+level[0]
			pos += 1
		end
		return mem
	end
end
