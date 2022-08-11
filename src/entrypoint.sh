export API_URL=${API_URL:=https://nexcityapi.umojodev.com}
export FRONTEND_API_URL=${FRONTEND_API_URL:=https://nexcityfeapi.umojodev.com}
export MAPBOX_API_TOKEN=${MAPBOX_API_TOKEN:=pk.eyJ1IjoibXItYWxlZGUiLCJhIjoiY2t2czIxcXVlMmg3djJxa2wyOXpwMTI5bSJ9.mr77q7sKRRUR3ccqD91RTQ}
export AAD_CLIENT_ID=${AAD_CLIENT_ID:=cedf3346-8919-4f2d-b91c-9d238b7c4cc2}
export AAD_AUTHORITY=${AAD_AUTHORITY:=https://login.microsoftonline.com/2b42b343-b349-421e-83fc-7f12b246bdbb}

envsubst < /usr/share/nginx/html/appConfiguration.template.json > /usr/share/nginx/html/appConfiguration.json

exec nginx -g 'daemon off;'