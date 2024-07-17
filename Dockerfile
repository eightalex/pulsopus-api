# Create an image
FROM node:20-alpine
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
WORKDIR /
ADD package.json package.json
#RUN rm -rf node_modules/
#RUN rm -rf yarn.lock
RUN yarn
ADD . .
RUN yarn run build
#CMD ["node", "./dist/main.js"]
#CMD [ "node", "dist/apps/reservations/main" ]


