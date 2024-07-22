# Create an image
FROM node:20-alpine
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
WORKDIR /
ADD package.json package.json
RUN yarn
ADD . .
RUN yarn run build


