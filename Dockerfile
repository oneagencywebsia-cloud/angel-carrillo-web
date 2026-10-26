FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY security-headers.conf /etc/nginx/security-headers.conf
COPY index.html robots.txt sitemap.xml llms.txt favicon.svg apple-touch-icon.png /usr/share/nginx/html/
COPY assets/ /usr/share/nginx/html/assets/
COPY servicios/ /usr/share/nginx/html/servicios/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
