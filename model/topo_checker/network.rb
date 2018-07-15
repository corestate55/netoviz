require_relative 'node'
require_relative 'link'

module TopoChecker
  class Network
    attr_reader :network_types, :network_id, :nodes, :links, :supporting_networks

    class SupportingNetwork
      attr_reader :network_ref

      def initialize(data)
        @network_ref = data['network-ref']
      end

      def to_s
        "nw_ref:#{@network_ref}"
      end
    end

    def initialize(data)
      @network_types = data['network-types']
      @network_id = data['network-id']

      @nodes = []
      @nodes = data['node'].map do |node|
        Node.new(node)
      end

      @links = []
      @links = data['ietf-network-topology:link'].map do |link|
        Link.new(link)
      end

      @supporting_networks = []
      if data.has_key?('supporting-network')
        @supporting_networks = data['supporting-network'].map do |nw|
          SupportingNetwork.new(nw)
        end
      end
    end

    def find_link(source, destination)
      @links.find {|link| link.source == source && link.destination == destination }
    end

    def check_all_link_pair
      @links.each do |link|
        # p "#{link.to_s}"
        next if find_link(link.destination, link.source)
        warn "Not Found: reverse link of #{link.to_s}"
      end
    end
  end
end
