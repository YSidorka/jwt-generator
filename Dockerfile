FROM node:22.13.1-alpine

WORKDIR /usr/app

COPY ./package*.json ./
RUN npm install --omit=dev
COPY ./ ./

CMD ["npm", "start"]
