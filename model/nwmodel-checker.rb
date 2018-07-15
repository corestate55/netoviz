require 'json'
require_relative 'topo_checker/networks_ops'

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
networks = TopoChecker::Networks.new(data)
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
