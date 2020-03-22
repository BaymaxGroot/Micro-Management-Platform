
RUN rm -rf /usr/share/nginx/html/citizen_mall_web/*

COPY ./nginx.conf /etc/nginx/nginx.conf

COPY ./dist/my-project/ -> /usr/share/nginx/html/citizen_mall_web