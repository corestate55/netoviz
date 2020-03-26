#!/usr/bin/env ruby
# frozen_string_literal: true

# method info container
class JSMethod
  attr :name, :visibility

  def initialize(name, visibility)
    @name = name
    @visibility = visibility
  end

  def uml_string(padding = '')
    "#{padding}#{visibility_mark}#{name}()"
  end

  private

  def visibility_mark
    case @visibility
    when :protected
      '#'
    when :private
      '-'
    else
      # default = :public
      '+'
    end
  end
end

# class info container
class JSClass
  attr_reader :name

  def initialize(name, extends = '')
    @name = name
    @extends = extends.nil? ? '' : extends
    @methods = []
    @relates = []
  end

  def add_method(name, visibility = :public)
    @methods.push(JSMethod.new(name, visibility))
  end

  def add_related_class(name)
    @relates.push(name)
  end

  def uml_strings
    class_defs = [
      "class #{@name} {",
      @methods.map { |m| m.uml_string('    ') },
      '}'
    ]
    class_defs.push("#{@name} --|> #{@extends}") unless @extends.empty?
    unless @relates.empty?
      class_defs.concat(@relates.uniq.map { |r| "#{@name} -- #{r}" })
    end
    class_defs
  end
end

# class/method data builder for each javascript files
class CodeFinder
  def initialize
    @class_list = []
    classify_each_line
  end

  def puts_plantuml
    puts '@startuml'
    @class_list.each do |js_class|
      puts js_class.uml_strings.join("\n")
    end
    puts '@enduml'
  end

  private

  def each_js_file
    return unless block_given?

    Dir.glob('{server,lib}/**/*.js').each do |js_file|
      File.open(js_file, 'r') do |file|
        # initialize: 1-file 1-class
        @current_class = nil
        yield file
        @class_list.push(@current_class) unless @current_class.nil?
      end
    end
  end

  def each_js_file_line
    return unless block_given?

    each_js_file do |file|
      file.each_line do |line|
        yield line
      end
    end
  end

  def check_class_header(line)
    return unless line =~ /^class (\w+)(?: extends (\w+))? {/

    @current_class = JSClass.new(Regexp.last_match(1), Regexp.last_match(2))
  end

  def check_class_body(line)
    case line
    when /\s+(\w+)\(.*\) {/
      @current_class.add_method(Regexp.last_match(1))
    when /new (\w+)\(/
      # TODO
      # Does it better to use `import FooBar`
      # for finding class relation instead of `new FooBar`?
      # Because using `new` cannot find relation with global function...
      # OR, Assume a global function as class with `export default FooBar`.
      # OR, Add global function like class.
      @current_class.add_related_class(Regexp.last_match(1))
    end
  end

  def classify_each_line
    each_js_file_line do |line|
      check_class_header(line)
      next if @current_class.nil?

      check_class_body(line)
    end
  end
end

# main
cf = CodeFinder.new
cf.puts_plantuml
