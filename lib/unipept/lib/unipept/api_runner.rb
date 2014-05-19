module Unipept
  class ApiRunner < Cri::CommandRunner

    def initialize(args, opts, cmd)
      super
      @configuration = Unipept::Configuration.new

      set_configuration

      @url = "#{@host}/api/v1/#{mapping[cmd.name]}.json"
      @message_url = "#{@host}/api/v1/messages.json"
    end

    def set_configuration
      # find host in opts first
      if options[:'config-host']
        host = options[:'config-host']
      else
        host = @configuration['host']
      end

      # No host has been set?
      if host.nil? || host.empty?
        puts "WARNING: no host has been set, you can set the host with `unipept config host http://localhost:3000/`"
        exit 1
      end
      if !host.start_with? "http://"
        host = "http://#{host}"
      end

      @host = host
    end

    def mapping
      {'pept2taxa' => 'pept2taxa', 'pept2lca' => 'pept2lca'}
    end

    def input_iterator
      # Argument over file input over stdin
      if !arguments.empty?
        arguments.each
      else
        if options[:input]
          IO.foreach(options[:input])
        else
          STDIN.each_line
        end
      end
    end

    def batch_size
      100
    end

    def url_options(sub_part)
      filter = options[:select] ? options[:select] : []
      if filter.empty?
        names = true
      else
        names = filter.any? {|f| /.*name.*/.match f}
      end
      {:input => sub_part,
       :equate_il => options[:equate],
       :extra => options[:extra],
       :names => names,
      }
    end

    def get_server_message
      return if options[:quiet]
      return unless STDOUT.tty?
      last_fetched = @configuration['last_fetch_date']
      if last_fetched.nil? || (last_fetched + 60 * 60 * 24) < Time.now
        version = File.read(File.join(File.dirname(__FILE__), "..", "VERSION"))
        puts Typhoeus.get(@message_url, params: {version: version}).body

        @configuration['last_fetch_date'] = Time.now
        @configuration.save
      end
    end

    def run
      get_server_message

      formatter = Unipept::Formatter.new_for_format(options[:format])
      peptides = input_iterator

      filter_list = options[:select] ? options[:select] : []
      filter_list = filter_list.map {|f| glob_to_regex(f) }
      output = STDOUT.tty? ? STDOUT : STDERR

      batch_order = Unipept::BatchOrder.new

      printed_header = false
      result = []

      hydra = Typhoeus::Hydra.new(max_concurrency: 10)
      num_req = 0

      peptide_iterator(peptides) do |sub_division, i, fasta_mapper|
        request = Typhoeus::Request.new(
          @url,
          method: :post,
          body: url_options(sub_division),
          accept_encoding: "gzip"
        )
        request.on_complete do |resp|
          if resp.timed_out?
            $stderr.puts "request timed out, continuing anyway, but results might be incomplete"
          else
            if resp.success?
              # if JSON parsing goes wrong
              sub_result = JSON[resp.response_body] rescue []
              sub_result = [sub_result] if not sub_result.kind_of? Array

              sub_result.map! {|r| r.select! {|k,v| filter_list.any? {|f| f.match k } } } if ! filter_list.empty?

              if options[:xml]
                result << sub_result
              end

              # wait till it's our turn to write
              batch_order.wait(i) do
                if ! sub_result.empty?
                  if ! printed_header
                    write_to_output formatter.header(sub_result, fasta_mapper)
                    printed_header = true
                  end
                  write_to_output formatter.format(sub_result, fasta_mapper)
                end
              end
            else
              save_error(resp.response_body)
            end
          end
        end
        hydra.queue request

        num_req += 1
        if num_req % 200 == 0
          hydra.run
        end

      end

      hydra.run

      begin
        download_xml(result)
      rescue
        STDERR.puts "Something went wrong while downloading xml information! please check the output"
      end

    end

    def save_error(message)
      path = File.expand_path(File.join(Dir.home, ".unipept", "unipept-#{Time.now.strftime("%F-%T")}.log"))
      FileUtils.mkdir_p File.dirname(path)
      File.open(path, "w") do |f|
        f.write message
      end
      $stderr.puts "API request failed! log can be found in #{path}"
    end

    def write_to_output(string)
      if options[:output]
        File.open(options[:output], 'a') do |f|
          f.write string
        end
      else
        puts string
      end
    end


    def download_xml(result)
      if options[:xml]
        File.open(options[:xml] + ".xml", "wb") do |f|
          f.write Typhoeus.get("http://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=taxonomy&id=#{result.first.map{|h| h['taxon_id'] }.join(",")}&retmode=xml").response_body
        end
      end
    end

    def peptide_iterator(peptides, &block)
      first = peptides.first
      if first.start_with? '>'
        # FASTA MODE ENGAGED
        fasta_header = first
        peptides.each_slice(batch_size).with_index do |sub,i|
          fasta_mapper = {}
          sub.map! {|s| s.chomp}
          j = 0
          while j < sub.size
            if sub[j].start_with? '>'
              fasta_header = sub[j]
            else
              fasta_mapper[sub[j]] = fasta_header
            end
            j += 1
          end
          sub -= fasta_mapper.values.uniq
          block.call(sub, i, fasta_mapper)
        end

      else
        peptides.each_slice(batch_size).with_index(&block)
      end
    end

    private

    def glob_to_regex(glob_string)
      # only implement * -> . for now
      Regexp.new glob_string.gsub("*", ".*")
    end
  end
end
