module Unipept
  class Configuration

    attr_reader :config
    attr_reader :file_name

    def initialize
      @file_name = File.join(Dir.home, ".unipeptrc")
      if !File.exists? file_name
        @config = {}
      else
        @config = YAML.load_file file_name
      end
    end

    def save
      File.open(file_name, 'w') { |f| f.write config.to_yaml }
    end

    def [](*args)
      config.[](*args)
    end

    def []=(*args)
      config.[]=(*args)
    end

  end
end
