# Chatbot Web Application

This project is a web application that allows users to interact with an AI chatbot. Initially, the chatbot generates random responses, and later, it integrates OpenAI API to provide more intelligent and context-aware responses.

## Features

1. User can enter queries in the provided input field.
2. Chatbot generates responses either randomly (initially) or using OpenAI API.
3. Responses are displayed in real-time on the web interface.

## Setup

Follow these steps to set up and run the project:

### Prerequisites

- Node.js installed on your machine.

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/chatbot-webapp.git
   cd chatbot-webapp

2. Install dependencies for both the server and the client:
cd chatbot-frontend
npm install
cd ../chatbot-backend
npm install

Configuration
1. Create a .env file in the server directory:
OPENAI_API_KEY=your_openai_api_key

Replace your_openai_api_key with your actual OpenAI API key.

Running the Application
1. Start the server:

cd chatbot-backend
npm start

The server will run on http://localhost:3000.

2. Start the client (in a new terminal window):
cd ../chatbot-frontend
npm start
The client will automatically open in your default web browser.

Technologies Used
Frontend: React
Backend: Node.js
Database: Excel (for storing embeddings)
OpenAI Models: text-embedding-ada-002, text-davinci-003

