module TopoChecker
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
end
