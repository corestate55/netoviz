require_relative 'network'

module TopoChecker
  class Networks
    attr_reader :networks

    def initialize(data)
      @networks = []
      data['ietf-network:networks']['network'].each do |each|
        @networks.push Network.new(each)
      end
    end

    def find_network(network_ref)
      @networks.find {|nw| nw.network_id == network_ref}
    end

    def find_node(network_ref, node_ref)
      find_network(network_ref).nodes.find do |node|
        node.node_id == node_ref
      end
    end

    def find_tp(network_ref, node_ref, tp_ref)
      find_node(network_ref, node_ref).termination_points.find do |tp|
        tp.tp_id == tp_ref
      end
    end

    def find_link(network_ref, link_ref)
      find_network(network_ref).links.find do |link|
        link.link_id == link_ref
      end
    end

    def all_networks
      @networks.each do |nw|
        yield nw
      end
    end

    def all_nodes
      all_networks do |nw|
        nw.nodes.each do |node|
          yield node, nw
        end
      end
    end

    def all_links
      all_networks do |nw|
        nw.links.each do |link|
          yield link, nw
        end
      end
    end

    def all_termination_points
      all_nodes do |node, nw|
        node.termination_points.each do |tp|
          yield tp, node, nw
        end
      end
    end

    private

    def ununique_element(list)
      list.group_by{|i| i}.reject{|k,v| v.one?}.keys
    end

    def ref_count(nw, tp_ref)
      tp = find_tp(nw.network_id, tp_ref.node_ref, tp_ref.tp_ref)
      tp.ref_count_up if (tp)
    end
  end
end
