module TopoChecker
  class Link
    attr_reader :link_id, :source, :destination, :supporting_links

    class TpRef
      attr_reader :node_ref, :tp_ref

      def initialize(data)
        @node_ref = data['source-node'] || data['dest-node']
        @tp_ref = data['source-tp'] || data['dest-tp']
      end

      def ==(other)
        @node_ref == other.node_ref && @tp_ref == other.tp_ref
      end

      def to_s
        "tp_ref:#{@node_ref}/#{tp_ref}"
      end
    end

    class SupportingLink
      attr_reader :network_ref, :link_ref
      def initialize(data)
        @network_ref = data['network-ref']
        @link_ref = data['link-ref']
      end

      def to_s
        "link_ref:#{@network_ref}/#{@link_ref}"
      end
    end

    def initialize(data)
      @link_id = data['link-id']
      @source = TpRef.new(data['source'])
      @destination = TpRef.new(data['destination'])

      @supporting_links = []
      if data.has_key?('supporting-link')
        @supporting_links = data['supporting-link'].map do |slink|
          SupportingLink.new(slink)
        end
      end
    end

    def to_s
      "link:#{@source.to_s}->#{@destination.to_s}"
    end
  end
end
