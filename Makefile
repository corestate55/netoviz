YANGFILES := ietf-network-topology@2018-02-26.yang ietf-network@2018-02-26.yang
JTOX := topo.jtox
TARGETJSON := target.json
TARGETXML := target.xml

all: $(TARGETXML)

$(TARGETXML): $(JTOX) $(TARGETJSON)
	ruby nwmodel-checker.rb $(TARGETJSON)
	json2xml $(JTOX) $(TARGETJSON) | xmllint --format - > $(TARGETXML)

$(JTOX): $(YANGFILES)
	pyang -f jtox -o $(JTOX) $(YANGFILES)
