🏛️ Justice Client Portal

Project Overview

This is a full-stack client portal application designed for a law firm, built using a modern containerized architecture. It features a secure login/signup system that connects a static frontend to a dedicated authentication API and a NoSQL database.

The entire application is deployed using Docker Compose with three interconnected services.

Architecture

The application runs as a three-tier system managed by Docker Compose:

Service	Role	Technology	                                                            Port
Frontend	   Client Interface, Static Assets	Nginx, HTML, CSS, JavaScript	        Host 8080
API/Backend	   Authentication, Business Logic	Node.js (Express), bcryptjs, Mongoose	Host 3000
Database	   Persistent User Data Storage	MongoDB	                                    Host 27017

That's a fantastic idea! A README.md file is the essential documentation for any project, especially one that uses Docker and a multi-container architecture. It tells others (and your future self) what the project is, how it works, and how to run it.

Here is a complete README.md file for your Justice Client Portal project.

🏛️ Justice Client Portal

Project Overview

This is a full-stack client portal application designed for a law firm, built using a modern containerized architecture. It features a secure login/signup system that connects a static frontend to a dedicated authentication API and a NoSQL database.

The entire application is deployed using Docker Compose with three interconnected services.

Architecture

The application runs as a three-tier system managed by Docker Compose:
Service	Role	Technology	Port
Frontend	Client Interface, Static Assets	Nginx, HTML, CSS, JavaScript	Host 8080
API/Backend	Authentication, Business Logic	Node.js (Express), bcryptjs, Mongoose	Host 3000
Database	Persistent User Data Storage	MongoDB	Host 27017

Prerequisites

To run this project locally, you must have the following installed:

    Git

    Docker (includes Docker Engine)

    Docker Compose

Getting Started

Follow these steps to clone the repository, build the containers, and run the application.

1. Clone the Repository

   git clone <YOUR_GITHUB_REPO_URL>
cd justice-client-portal

2. Project Structure

Ensure your file structure matches the one expected by the docker-compose.yml file:

justice-client-portal/
├── docker-compose.yml          # Defines the 3 services (frontend, api, mongodb)
├── Dockerfile                  # Builds the Nginx Frontend image
├── html/                       # Static files
│   ├── front.html              # Main dashboard page
│   └── signup7in.html          # Login/Signup form with API calls
└── backend/                    # Node.js API files
    ├── Dockerfile              # Builds the Node.js API image
    ├── package.json
    └── server.js               # Express server with /login and /signup routes

3. Build and Run the Containers

Use Docker Compose to build the custom images and start all three services simultaneously.
Bash

docker compose up --build -d

    --build: Forces a fresh build of the frontend and api images.

    -d: Runs the containers in detached mode (in the background).
    
4. Access the Application

Once the containers are running (this may take a minute for the first build), open your web browser:

Login/Signup Page:

      http://localhost:8080/signup7in.html            


Usage Instructions

    Signup: Go to the "Create Account" tab and register a new user with an email and password. This will save the credentials (with a hashed password) to the MongoDB database.

    Sign In: Switch to the "Sign In" tab and use the registered credentials.

    Redirection: Upon successful authentication via the Node.js API and MongoDB, the frontend will automatically redirect you to front.html.

Key DevOps Concepts Demonstrated

This project showcases fundamental DevOps skills:

    Containerization: Isolating the frontend (Nginx), backend (Node), and database (Mongo) into separate, portable containers.

    Orchestration: Using docker-compose.yml to define and manage the lifecycle of the multi-container application and its network.

    Microservices: Employing a dedicated API service to handle the security and business logic separate from the presentation layer.

    Internal Networking: The Node.js API resolves the database using its service name (mongodb) within the Docker network, not localhost.

Cleanup

To stop and remove all containers, networks, and volumes created by Docker Compose, run:
Bash

docker compose down -v

    -v: Removes the Docker volume, including the database data (mongo_data). Use with caution, as this wipes all registered user accounts.

⚙️ Technologies Used

    Frontend: HTML5, CSS3, Bootstrap, Vanilla JavaScript

    Web Server: Nginx (via nginx:alpine)

    Backend: Node.js, Express

    Database: MongoDB

    Security: bcryptjs for password hashing

    Deployment: Docker, Docker Compose

