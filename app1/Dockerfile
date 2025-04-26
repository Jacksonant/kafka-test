FROM node:20-alpine

WORKDIR /app

# Copy package.json and yarn.lock for more efficient caching
COPY package.json yarn.lock /app/

RUN yarn install
RUN yarn global add nodemon

COPY index.js ./

CMD [ "nodemon", "index.js" ]
