# Dockerfile for Next.js
FROM node:22.9.0

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Expose the application port
EXPOSE 3000

#test commit

# Start the application
CMD ["npm", "start"]
