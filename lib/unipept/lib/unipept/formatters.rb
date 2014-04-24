module Unipept
  class Formatter

    def self.formatters
      @@formatters ||= {}
    end

    def self.new_for_format(format)
      begin
        formatters[format].new
      rescue
        formatters[self.default].new
      end
    end

    def self.register(format)
      self.formatters[format.to_s] = self
    end

    def self.available
      self.formatters.keys
    end

    def self.default
      'csv'
    end

    # JSON formatted data goes in, something other comes out
    def format(data)
      data
    end
  end

  class JSONFormatter < Formatter
    require 'json'
    register :json

    def format(data)
      data.to_json
    end

  end
  class CSVFormatter < Formatter
    require 'csv'

    register :csv

    def format(data)
      CSV.generate do |csv|
        first = data.first
        if first.kind_of? Array
          first = first.first
        end
        csv << first.keys.map(&:to_s)

        data.each do |o|
          if o.kind_of? Array
            o.each {|h| csv << h.values }
          else
            csv << o.values
          end
        end
      end
    end
  end

  class XMLFormatter < Formatter

    # Monkey patch (do as to_xml, but saner)

    class ::Object
      def to_xml(name = nil)
        name ? %{<#{name}>#{self.to_s}</#{name}>} : self.to_s
      end
    end

    class ::Array
      def to_xml( array_name = :array, item_name = :item )
        %|<#{array_name} size="#{self.size}">|+map{|n|n.to_xml( :item )}.join+"</#{array_name}>"
      end
    end

    class ::Hash
      def to_xml( name = nil )
        data = to_a.map{|k,v|v.to_xml(k)}.join
        name ? "<#{name}>#{data}</#{name}>" : data
      end
    end

    register :xml

    def format(data)
      data.to_xml
    end

  end


end
