#!/bin/bash

docker run --name nginx-bench -p 8000:80 -v $PWD/nginx/resources:/usr/share/nginx/html:ro -v $PWD/nginx/nginx.conf:/etc/nginx/nginx.conf:ro -d nginx 