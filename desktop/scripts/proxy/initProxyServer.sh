#!/bin/sh

proxyPort=$1

apt-get -y update
apt upgrade -y
apt-get -y update
apt-get install -y squid

systemctl enable squid
cp /etc/squid/squid.conf /etc/squid/squid.conf.orig

cat <<EOF > /etc/squid/squid.conf
acl internal src 10.0.0.0/16
http_port ${proxyPort}
http_access allow internal
EOF

systemctl restart squid
