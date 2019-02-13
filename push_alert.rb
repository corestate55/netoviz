require 'json'

class RandomArg
  def initialize
    @hosts = make_hosts
  end

  def make_hosts
    json_file = './public/model/target3b.json'
    json_data = open(json_file) do |file|
      JSON.load(file)
    end
    networks = json_data['ietf-network:networks']

    hosts = []
    networks['network'].each do |network|
      hosts.push(network['node'].map { |node| node['node-id'] })
    end
    hosts.flatten.sort.uniq
  end

  def make_severities
    [ :unknown, :fatal, :error, :warn, :info, :debug ]
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
      severity: make_severities.sample,
      date: current_date_string,
      message: make_message(host)
    }
    JSON.dump(arg_data)
  end
end

rand_arg = RandomArg.new
url = 'http://localhost:3000/alert'
headers = [
  'Content-type: application/json',
  'Accept: application/json'
]
header_str = headers.map { |h| "-H '#{h}'" }.join(' ')
exec_str = "curl -X POST #{url} #{header_str} -d '#{rand_arg.make_arg}'"
puts exec_str
exec exec_str
