FROM node:24-bookworm-slim
WORKDIR /app
COPY package.json index.html ./
COPY server/ server/
COPY shared/ shared/
COPY migrations/ migrations/
COPY src/ src/
COPY assets/ assets/
RUN mkdir -p /data && chown node:node /data
USER node
ENV NODE_ENV=production PORT=4173 VEIL_DATA_DIR=/data VEIL_BIND=0.0.0.0
EXPOSE 4173
CMD ["node", "server/server.cjs"]
