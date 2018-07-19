#!/bin/bash

data=`echo $1 | sed -e "s/[\r\n]//g"`
src=`echo $data | cut -d, -f1`
sp=`echo $data | cut -d, -f2`
dst=`echo $data | cut -d, -f3`
dp=`echo $data | cut -d, -f4`

cat <<EOF
          {
            "link-id": "$src,$sp,$dst,$dp",
            "source": {
              "source-node": "$src",
              "source-tp": "$sp"
             },
             "destination": {
               "dest-node": "$dst",
               "dest-tp": "$dp"
             }
           },
           {
             "link-id": "$dst,$dp,$src,$sp",
             "source": {
               "source-node": "$dst",
               "source-tp": "$dp"
             },
             "destination": {
               "dest-node": "$src",
               "dest-tp": "$sp"
             }
           },
EOF
