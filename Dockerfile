# STEP 1: Use a minimal Nginx image as the base
# Nginx is a powerful, lightweight web server perfect for serving static files (like your HTML).
FROM nginx:alpine

# STEP 2: Remove the default Nginx configuration files
# We don't need them since we are serving a simple project.
RUN rm -rf /usr/share/nginx/html/*

# STEP 3: Copy your project files into the Nginx public directory
# Your front.html and signup7in.html files, along with any CSS/JS files,
# must be placed in a directory called 'html' relative to the Dockerfile.
COPY ./html /usr/share/nginx/html

# STEP 4: Expose the port Nginx runs on
# This is the standard HTTP port.
EXPOSE 80

# STEP 5: Command to run Nginx when the container starts
# This is the default command inherited from the Nginx base image.
CMD ["nginx", "-g", "daemon off;"]
