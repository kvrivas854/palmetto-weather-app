# Use Node.js as the base image
FROM node:22.7.0

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Expose the React development server port
EXPOSE 3000

# Start the React application
CMD ["npm", "start"]
