# customised-chatbot-2022mt12088

This project is a web application that allows users to interact with an AI chatbot. Initially, the chatbot generates random responses, and later, it integrates OpenAI API to provide more intelligent and context-aware responses.

## Features

1. Basic Chat Interface:
   
   User can enter queries in the provided input field.
   Chatbot generates responses either randomly (initially) 


2. OpenAI Integration:
   
   Extends the Chatbot to use OpenAI API (text-davinci-003) for advanced responses.

   API key provided for this step only.

3. Domain-Specific Knowledge:

   Customizes responses based on domain-specific knowledge from supplied PDFs.
   
   Uses OpenAI embedding model API (text-embedding-ada-002).

4. PDF Upload and Integration:
   
   Allows users to upload and browse multiple PDFs.
   PDF content sets the context for Chatbot responses.
   Utilizes Excel as a database for storing PDF embeddings.

## Setup

Follow these steps to set up and run the project:

### Prerequisites

- Node.js installed on your machine.

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/ankithayamini/customised-chatbot-2022mt12088.git
   cd customised-chatbot-2022mt12088

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
1. Start the client (in a new terminal window):
  cd ../chatbot-frontend
  npm start
The client will automatically open in your default web browser.

2. Start the server:
  cd chatbot-backend
  npm start

The server will run on http://localhost:3000.

Technologies Used
Frontend: React
Backend: Node.js
Database: Excel (for storing embeddings)
OpenAI Models: text-embedding-ada-002, text-davinci-003
