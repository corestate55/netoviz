require 'json'

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

class Node
  attr_reader :node_id, :termination_points, :supporting_nodes

  class SupportingNode
    attr_reader :network_ref, :node_ref

    def initialize(data)
      @network_ref = data['network-ref']
      @node_ref = data['node-ref']
    end

    def to_s
      "node_ref:#{@network_ref}/#{@node_ref}"
    end
  end

  def initialize(data)
    @node_id = data['node-id']

    @termination_points = []
    @termination_points = data['ietf-network-topology:termination-point'].map do |tp|
      TerminationPoint.new(tp)
    end

    @supporting_nodes = []
    if data.has_key?('supporting-node')
      @supporting_nodes = data['supporting-node'].map do |snode|
        SupportingNode.new(snode)
      end
    end
  end
end

class TerminationPoint
  attr_reader :tp_id, :supporting_termination_points, :ref_count

  class SupportingTerminationPoint
    attr_reader :network_ref, :node_ref, :tp_ref

    def initialize(data)
      @network_ref = data['network-ref']
      @node_ref = data['node-ref']
      @tp_ref = data['tp-ref']
    end

    def to_s
      "tp_ref:#{@network_ref}/#{@node_ref}/#{@tp_ref}"
    end
  end

  def initialize(data)
    @tp_id = data['tp-id']
    @ref_count = 0

    @supporting_termination_points = []
    if data.has_key?('supporting-termination-point')
      @supporting_termination_points = data['supporting-termination-point'].map do |stp|
        SupportingTerminationPoint.new(stp)
      end
    end
  end

  def ref_count_up
    @ref_count = @ref_count + 1
  end
end

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

## read file
data = []
if ARGV.length > 0
  File.open(ARGV[0]) do |file|
    data = JSON.load(file)
  end
else
  warn "usage: #{$0} file.json"
  exit 1
end

# p data
networks = Networks.new(data)
p "## check all supporting networks"
networks.check_all_supporting_networks
p "## check all supporting nodes"
networks.check_all_supporting_nodes
p "## check all supporting termination points"
networks.check_all_supporting_termination_points
p "## check all supporting links"
networks.check_all_supporting_links
p "## check all link pair"
networks.check_all_link_pair
p "## check uniqueness"
networks.check_object_uniqueness
p "## check terminal point reference count"
networks.check_tp_ref_count
