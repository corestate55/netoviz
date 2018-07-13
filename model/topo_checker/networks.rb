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

    def check_all_supporting_networks
      all_networks do |nw|
        nw.supporting_networks.each do |snw|
          next if find_network(snw.network_ref)
          warn "Not found: #{snw.to_s} of nw:#{nw.network_id}"
        end
      end
    end

    def check_all_supporting_nodes
      all_nodes do |node, nw|
        node.supporting_nodes.each do |snode|
          # p "#{nw.network_id}/#{node.node_id} refs #{snode.to_s}"
          next if find_node(snode.network_ref, snode.node_ref)
          warn "Not Found: #{snode.to_s} of node:#{nw.network_id}/#{node.node_id}"
        end
      end
    end

    def check_all_supporting_termination_points
      all_termination_points do |tp, node, nw|
        tp.supporting_termination_points.each do |stp|
          # p "#{nw.network_id}/#{node.node_id}/#{tp.tp_id} refs #{stp.to_s}"
          next if find_tp(stp.network_ref, stp.node_ref, stp.tp_ref)
          warn "Not Found: #{stp.to_s} of tp:#{nw.network_id}/#{node.node_id}/#{tp.to_id}"
        end
      end
    end

    def check_all_supporting_links
      all_links do |link, nw|
        link.supporting_links.each do |slink|
          # p "#{nw.network_id}/#{link.link_id} refs #{slink.to_s}"
          next if find_link(slink.network_ref, slink.link_ref)
          warn "Not Found: #{slink.to_s} of link:#{nw.network_id}/#{link.link_id}"
        end
      end
    end

    def check_all_link_pair
      all_networks do |nw|
        nw.check_all_link_pair
      end
    end

    def check_object_uniqueness
      check_network_id_uniqueness
      check_node_id_uniqueness
      check_link_id_uniqueness
      check_tp_id_uniqueness
    end

    def check_tp_ref_count
      all_links do |link, nw|
        ref_count(nw, link.source)
        ref_count(nw, link.destination)
      end

      unref_tps = []
      all_termination_points do |tp, node, nw|
        if tp.ref_count == 0 || tp.ref_count % 2 != 0 || tp.ref_count >= 4
          warn "WARNING: #{nw.network_id}/#{node.node_id}/#{tp.tp_id} ref_count = #{tp.ref_count}"
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

    def check_network_id_uniqueness
      network_ids = @networks.map {|nw| nw.network_id}
      return if @networks.size == network_ids.uniq.size
      warn "WARNING: There are duplicate 'network_id's"
      warn "#=> #{ununique_element network_ids}"
    end

    def check_node_id_uniqueness
      all_networks do |nw|
        node_ids = nw.nodes.map {|node| node.node_id}
        next if nw.nodes.size == node_ids.uniq.size
        warn "WARNING: There are duplicate 'node_id's in #{nw.network_id}"
        warn "#=> #{ununique_element node_ids}"
      end
    end

    def check_link_id_uniqueness
      all_networks do |nw|
        link_ids = nw.links.map {|link| link.link_id}
        next if nw.links.size == link_ids.uniq.size
        warn "WARNING: There are duplicate 'link_id's in #{nw.network_id}"
        warn "#=> #{ununique_element link_ids}"
      end
    end

    def check_tp_id_uniqueness
      all_nodes do |node, nw|
        tp_ids = node.termination_points.map {|tp| tp.tp_id}
        next if node.termination_points.size == tp_ids.uniq.size
        warn "WARNING: There are duplicate 'tp_id's in #{nw.network_id}/#{node.node_id}"
        warn "#=> #{ununique_element tp_ids}"
      end
    end
  end
end
