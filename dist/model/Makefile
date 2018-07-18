YANGFILES := yang/ietf-l3-unicast-topology@2018-02-26.yang yang/ietf-network-topology@2018-02-26.yang yang/ietf-network@2018-02-26.yang
JTOX := topol3.jtox
TARGETJSON := target.json
TARGETXML := target.xml
CHECKER := nwmodel-checker.rb
CHECKERSRC := $(CHECKER) $(wildcard topo_checker/*.rb)

all: $(TARGETXML)

$(TARGETXML): $(JTOX) $(TARGETJSON) $(CHECKERSRC)
	jsonlint-cli $(TARGETJSON)
	ruby $(CHECKER) $(TARGETJSON)
	json2xml $(JTOX) $(TARGETJSON) | xmllint --output $(TARGETXML) --format -

$(JTOX): $(YANGFILES)
	pyang -f jtox -o $(JTOX) $(YANGFILES)
