module Unipept
  class Formatter

    attr_reader :data

    # JSON formatted data goes in, something other comes out
    def initialize(data)
      @data = data
    end

    def format
      @data
    end
  end


  class CSVFormatter
    require 'csv'

    def format
      @data.to_csv
    end

  end
end
