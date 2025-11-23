
# to build Docker container run:
# bun run build &&
# docker build -f ./Dockerfile -t <your Docker registry and app name> .

# to also push it to your Docker registry:
# docker push <above Docker registry and app name>


FROM nginx:stable-alpine
# copy to subfolder /direct-talk to that app is reachable under <your domain>/direct-talk
COPY dist/ /usr/share/nginx/html/direct-talk
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
