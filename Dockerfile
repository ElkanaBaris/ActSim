FROM node:20

# Install git-lfs
RUN apt-get update && \
    apt-get install -y git-lfs && \
    git lfs install && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY . .
RUN npm install && npm run build

EXPOSE 5000
CMD ["npm", "start"]
