FROM node:20-alpine AS builder
#FROM dieter1962/nodeimages:1.0
USER node

WORKDIR /home/node

ADD --chown=node:node package.json .
ADD --chown=node:node package-lock.json .

RUN npm install

ADD --chown=node:node . .

# RUN npm install &&  npm run build
RUN npm run build
##----------------- Stagebuild

FROM node:20-alpine
#FROM dieter1962/nodeimages:1.0
USER node

WORKDIR /home/node

COPY --from=builder /home/node/package.json ./package.json
COPY --from=builder /home/node/package-lock.json ./package-lock.json
COPY --from=builder /home/node/dist ./dist



RUN npm install --omit=dev


CMD [ "npm", "start" ]
 