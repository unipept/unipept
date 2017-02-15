class SearchController < ApplicationController
	def single
		@title = 'Tryptic Peptide Analysis'
		@header_class = 'TPA'
	end

    def comparison
	  	@header_class = 'CPA'

	  	# variables
	  	@json_roots = Array.new
	  	@json_sequences = Array.new
	  	@json_missed = Hash.new
	  	number_found_per_file = Hash.new
	  	number_searched_for_dup = 0
	  	number_searched_for = 0
	  	csv_string = ''

	    # save parameters
	    @p = params.to_h

	    # set search parameters
	    @equate_il = params[:il] == '1'
	    filter_duplicates = params[:dupes] == '1'
	    handle_missed = params[:missed] == '1'
	    export = params[:export] == '1'
	    search_name = params[:search_name] # name of files
	    queries = JSON.parse(params[:qc])

	    # quit if the query was empty
	    raise EmptyQueryError if queries.blank? || queries.length < 3

	    queries.each do |filename, query|
	    	p query.split(',').count
		    # remove duplicates, filter shorts, substitute I by L, ...
		    data = query.upcase.delete('#').gsub(/\P{ASCII}/, '')
		    data = data.gsub(/([KR])([^P])/, "\\1\n\\2").gsub(/([KR])([^P])/, "\\1\n\\2") unless handle_missed
		    data = data.lines.map(&:strip).to_a.select { |l| l.size >= 5 }
		    sequence_mapping = Hash[data.map { |v| @equate_il ? [v.tr('I', 'L'), v] : [v, v] }]
		    data = data.map { |s| @equate_il ? s.tr('I', 'L') : s }
		    data_counts = Hash[data.group_by { |k| k }.map { |k, v| [k, v.length] }]
		    number_searched_for_dup += data.length
		    data = data_counts.keys

		 	# set metrics
		    number_searched_for += data.length if filter_duplicates
		    @number_found = 0

		    # build the resultset
		    matches = {}
		    misses = data.to_set
		    data.each_slice(1000) do |data_slice|
		      Sequence.includes(Sequence.lca_t_relation_name(@equate_il) => { lineage: Lineage::ORDER_T }).where(sequence: data_slice).each do |sequence|
		        lca_t = sequence.calculate_lca(@equate_il, true)
		        unless lca_t.nil?
		          num_of_seq = filter_duplicates ? 1 : data_counts[sequence.sequence]
		          @number_found += num_of_seq
		          matches[lca_t] = [] if matches[lca_t].nil?
		          num_of_seq.times do
		            matches[lca_t] << sequence_mapping[sequence.sequence]
		          end
		        end
		        misses.delete(sequence.sequence)
		      end
		    end

		    # handle the misses
		    if handle_missed
		      iter = misses.to_a
		      iter.each do |seq|
		        sequences = seq.gsub(/([KR])([^P])/, "\\1\n\\2").gsub(/([KR])([^P])/, "\\1\n\\2").lines.map(&:strip).to_a
		        next if sequences.size == 1
		        # heuristic optimization to evade short sequences with lots of matches
		        min_length = [8, sequences.max_by(&:length).length].min
		        sequences = sequences.select { |s| s.length >= min_length }

		        long_sequences = sequences.map { |s| Sequence.includes(Sequence.peptides_relation_name(@equate_il) => { uniprot_entry: :lineage }).find_by(sequence: s) }

		        # jump the loop if we don't have any matches
		        next if long_sequences.include? nil
		        next if long_sequences.empty?

		        # calculate possible uniprot entries
		        temp_entries = long_sequences.map { |s| s.peptides(@equate_il).map(&:uniprot_entry).to_set }
		        # take the intersection of all sets
		        entries = temp_entries.reduce(:&)
		        # check if the protein contains the startsequence
		        entries.select! { |e| e.protein_contains?(seq, @equate_il) }

		        # skip if nothing left
		        next if entries.empty?

		        seq_lins = entries.map(&:lineage).uniq.compact
		        lca_t = Lineage.calculate_lca_taxon(seq_lins) # calculate the LCA

		        unless lca_t.nil?
		          num_of_seq = filter_duplicates ? 1 : data_counts[seq]
		          @number_found += num_of_seq
		          matches[lca_t] = [] if matches[lca_t].nil?
		          num_of_seq.times do
		            matches[lca_t] << sequence_mapping[seq]
		          end
		        end
		        misses.delete(seq)
		      end
		    end

		    @json_missed[filename] = Oj.dump(misses.map { |m| sequence_mapping[m] }.to_a.sort, mode: :compat)

		    # construct treemap nodes
		    root = Node.new(1, 'Organism', nil, 'no rank')
		    matches.each do |taxon, seqs| # for every match
		      lca_l = taxon.lineage

		      # export stuff
		      if export
		        seqs.each do |sequence|
		          csv_string += CSV.generate_line [sequence].concat(lca_l.to_a)
		        end
		      end

		      last_node_loop = root
		      while !lca_l.nil? && lca_l.has_next? # process every rank in lineage
		        t = lca_l.next_t
		        next if t.nil?
		        node = Node.find_by_id(t.id, root)
		        if node.nil?
		          node = Node.new(t.id, t.name, root, t.rank)
		          last_node_loop = last_node_loop.add_child(node)
		        else
		          last_node_loop = node
		        end
		      end
		      node = taxon.id == 1 ? root : Node.find_by_id(taxon.id, root)
		      node&.set_sequences(seqs)
		    end

			@json_sequences << Oj.dump(root.sequences, mode: :compat)
		    root&.prepare_for_multitree
		    root&.sort_children
		    @json_roots << Oj.dump(root, mode: :compat)

		   	number_found_per_file[filename] = @number_found
		end

	    # prepare for output
	    @title = 'comparative analysis result'
	    @title += ' of ' + search_name unless search_name.nil? || search_name == ''
	    @pride_url = "http://www.ebi.ac.uk/pride/archive/assays/#{search_name[/[0-9]*$/]}" if search_name.include? 'PRIDE assay'

	    filenames = queries.keys
	    number_searched = filter_duplicates ? number_searched_for : number_searched_for_dup
	    @intro_text = "#{number_found_per_file.values.inject(0) {|a,b|a+b}} out of #{number_searched} #{'peptide'.send(number_searched != 1 ? :pluralize : :to_s)} were matched, "
	   	@intro_text += "#{number_found_per_file[filenames[1]]} peptides were uniquely matched to #{filenames[1]}, " 
	   	@intro_text += "#{number_found_per_file[filenames[2]]} peptides where uniquely matched to #{filenames[2]} and "
	   	@intro_text += "#{number_found_per_file[filenames[0]]} where matched to both samples."
	    if filter_duplicates || @equate_il
	      @intro_text += ' ('
	      @intro_text += 'peptides were deduplicated' if filter_duplicates
	      @intro_text += ', ' if filter_duplicates && @equate_il
	      @intro_text += 'I and L residues were equated' if @equate_il
	      @intro_text += ', ' if filter_duplicates || @equate_il
	      @intro_text += handle_missed ? 'advanced missed cleavage handling' : 'simple missed cleavage handling'
	      @intro_text += ')'
	    end
	    @intro_text += '.'

	    # TODO: make sure they work for all samples (output per sample)
		if export
	      	csv_string = CSV.generate_line(['peptide'].concat(Lineage.ranks)) + csv_string

	      	cookies['nonce'] = params[:nonce]
	      	filename = search_name != '' ? search_name : 'export'
	      	send_data csv_string, type: 'text/csv; charset=iso-8859-1; header=present', disposition: 'attachment; filename=' + filename + '.csv'
	    end

  	rescue EmptyQueryError
    	flash[:error] = 'Your query was empty, please try again.'
    	redirect_to datasets_path
  	end
end

class EmptyQueryError < StandardError; end
