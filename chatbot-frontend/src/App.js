import React, { useState } from 'react';

const App = () => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [isSending, setIsSending] = useState(false);

  const handleQueryChange = (event) => {
    setQuery(event.target.value);
  };

  const handleFileChange = (event) => {
    setPdfFile(event.target.files[0]);
  };

  const handleSendMessage = async () => {
    if (isSending) {
      // Prevent sending multiple requests in quick succession
      return;
    }

    try {
      setIsSending(true);

      const formData = new FormData();
      formData.append('query', query);
      formData.append('pdf', pdfFile);

      const response = await fetch('http://localhost:3000/openai-response', {
        method: 'POST',
        body: formData,
      });

      if (response.status === 429) {
        console.error('Too many requests. Please wait before sending another.');
        // You can display an error message to the user
        return;
      }

      if (!response.ok) {
        console.error('Request failed with status:', response.status);
        // Handle other error scenarios
        return;
      }

      const data = await response.json();
      setResponse(data.message);
    } catch (error) {
      console.error('Error fetching OpenAI response:', error);
    } finally {
      // Introduce a delay (adjust as needed) before allowing the next request
      setTimeout(() => {
        setIsSending(false);
      }, 1000); // 1000 milliseconds = 1 second
    }
  };

  return (
    <div className="App">
      <h1>Chatbot App</h1>
      <div>
        <input
          type="text"
          value={query}
          onChange={handleQueryChange}
          placeholder="Type your message..."
        />
        <input type="file" accept=".pdf" onChange={handleFileChange} />
        <button onClick={handleSendMessage}>Send</button>
      </div>
      <div>
        <p>{response}</p>
      </div>
    </div>
  );
};

export default App;
