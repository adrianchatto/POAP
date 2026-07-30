FROM nginx:1.27-alpine

COPY index.html /usr/share/nginx/html/index.html
COPY styles.css /usr/share/nginx/html/styles.css
COPY app.js /usr/share/nginx/html/app.js
COPY manifest.webmanifest /usr/share/nginx/html/manifest.webmanifest
COPY assets /usr/share/nginx/html/assets
COPY implementation-plan.json /usr/share/nginx/html/implementation-plan.json
