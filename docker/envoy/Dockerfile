FROM envoyproxy/envoy:v1.14.1
COPY envoy.yaml.template /etc/envoy
COPY docker-entrypoint.sh /
RUN apt-get update && apt-get install -y --no-install-recommends gettext-base
# ENTRYPOINT /bin/sh -c /docker-entrypoint.sh
CMD /usr/local/bin/envoy -c /etc/envoy/envoy.yaml
