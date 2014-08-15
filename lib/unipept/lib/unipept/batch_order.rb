module Unipept

  class BatchOrder

    attr_reader :order

    def initialize
      @order = {}
      @current = 0
    end

    def wait(i, &block)
      if i == @current
        # start writing + those who have been waiting as well
        block.call
        @current += 1
        while order[@current]
          order.delete(@current).call
          @current += 1
        end
      else
        @order[i] = block
      end
    end

  end

end
