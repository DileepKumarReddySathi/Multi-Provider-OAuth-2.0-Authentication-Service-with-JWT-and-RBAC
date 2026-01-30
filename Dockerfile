FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

# Install curl for healthcheck
RUN apk --no-cache add curl

EXPOSE 8080

CMD ["npm", "start"]
