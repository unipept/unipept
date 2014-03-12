module Unipept
  class Formatter

    def self.formatters
      @formatters ||= {}
    end

    def self.new_for_format(format)
      formatters[format].new rescue new
    end

    def self.register(format)
      self.formatters[format.to_s] = self
    end

    def initialize
    end

    # JSON formatted data goes in, something other comes out
    def format(data)
      data
    end
  end

  class CSVFormatter < Formatter
    require 'csv'

    register :csv

    def format(data)
      data.to_csv
    end
  end
end
