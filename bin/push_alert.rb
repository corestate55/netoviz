#!/usr/bin/env ruby
# frozen_string_literal: true

require 'json'
require 'optparse'

# random argument generator for alert log
class RandomArg
  def initialize(file)
    @json_file = file
    @hosts = make_hosts
    @severities = make_severities
  end

  def make_hosts
    json_data = File.open(@json_file) do |file|
      JSON.parse(file.read)
    end
    networks = json_data['ietf-network:networks']

    hosts = []
    networks['network'].each do |network|
      hosts.push(network['node'].map { |node| node['node-id'] })
    end
    hosts.flatten.sort.uniq
  end

  def make_severities
    base = %w[disaster high average warning information not_classified]
    [base, base.map { |s| s.dup.capitalize! }].flatten
  end

  def make_message(host)
    "something log message from #{host}"
  end

  def current_date_string
    Time.new.to_s
  end

  def make_arg
    host = @hosts.sample
    arg_data = {
      host: host,
      severity: @severities.sample,
      date: current_date_string,
      message: make_message(host)
    }
    JSON.dump(arg_data)
  end
end

opt = {
  addr: 'localhost',
  port: 3000
}
opt_parser = OptionParser.new
opt_parser.on('-f', '--file=FILE', 'Topology file (json)') do |v|
  opt[:file] = v
end
opt_parser.on('-a', '--addr=ADDR', 'Address to send alert') do |v|
  opt[:addr] = v
end
opt_parser.on('-p', '--port=PORT', 'Port number to send alert') do |v|
  opt[:port] = v.to_i
end
opt_parser.on('-h', '--help', 'Show this help') do
  puts opt_parser
  exit 0
end
opt_parser.parse(ARGV)

if opt[:file].nil? || (opt[:port] <= 0 && opt[:port] >= 65536) || opt[:addr].nil?
  STDERR.puts opt_parser
  exit 1
end

rand_arg = RandomArg.new(opt[:file])
url = "http://#{opt[:addr]}:#{opt[:port]}/api/alert"
headers = [
  'Content-type: application/json',
  'Accept: application/json'
]
header_str = headers.map { |h| "-H '#{h}'" }.join(' ')
exec_str = "curl -X POST #{url} #{header_str} -d '#{rand_arg.make_arg}'"
puts exec_str
exec exec_str
