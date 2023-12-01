const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
const exceljs = require('exceljs');
const multer = require('multer');
const fs = require('fs');
const pdf = require('pdf-parse');
require('dotenv').config();

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Set up multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

let pdfEmbeddings; // Assuming pdfEmbeddings is declared globally

async function getEmbeddingsFromOpenAI(pdfContent) {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/embeddings',
      {
        model: "text-embedding-ada-002",
        input: [pdfContent],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );

    pdfEmbeddings = response.data.data[0].embedding;
    return pdfEmbeddings;
  } catch (error) {
    console.error('Error getting OpenAI embeddings:', error);
    throw error;
  }
}

async function storeEmbeddingsInExcel(text, embeddings) {

  console.log('text: ', text);
  try {
    const workbook = new exceljs.Workbook();
    const sheetName = 'Embeddings';

    try {
      await workbook.xlsx.readFile('embeddings.xlsx');
    } catch (readError) {
      // Ignore read error if the file doesn't exist
    }

    let sheet = workbook.getWorksheet(sheetName);

    if (!sheet) {
      sheet = workbook.addWorksheet(sheetName);
      console.log(`Created a new worksheet: ${sheetName}`);
    }

    // Check if the text already exists in the sheet
    const existingRow = sheet.findRow(text);

    // If the text doesn't exist, store the text and embeddings
    if (!existingRow) {
      sheet.addRow([text, ...embeddings]);
      await workbook.xlsx.writeFile('embeddings.xlsx');
      console.log('Text and embeddings stored successfully.');
    } else {
      console.log('Text already exists. Skipping storage.');
    }
  } catch (error) {
    console.error('Error storing text and embeddings in Excel:', error);
    throw error;
  }
}


async function getStoredEmbeddingsFromExcel() {
  try {
    const workbook = new exceljs.Workbook();
    await workbook.xlsx.readFile('embeddings.xlsx');

    const sheet = workbook.getWorksheet('Embeddings');
    const embeddings = [];

    sheet.eachRow((row, rowNumber) => {
      if (rowNumber !== 1) { // Skip the header row
        const rowValues = row.values.slice(2).map(Number); // Fetch numeric values starting from column index 2
        embeddings.push(rowValues);
      }
    });

    return embeddings;
  } catch (error) {
    console.error('Error getting stored embeddings from Excel:', error);
    throw error;
  }
}


function calculateCosineSimilarity(embedding1, embedding2) {
  const dotProduct = embedding1.reduce((acc, val, i) => acc + val * embedding2[i], 0);
  const magnitude1 = Math.sqrt(embedding1.reduce((acc, val) => acc + val ** 2, 0));
  const magnitude2 = Math.sqrt(embedding2.reduce((acc, val) => acc + val ** 2, 0));

  return dotProduct / (magnitude1 * magnitude2);
}

async function getStoredTextFromExcel(rowIndex) {
  try {
    const workbook = new exceljs.Workbook();
    await workbook.xlsx.readFile('embeddings.xlsx');

    const sheet = workbook.getWorksheet('Embeddings');

    if (sheet) {
      const storedText = sheet.getRow(rowIndex).values[1];
      return storedText;
    }

    return null;
  } catch (error) {
    console.error('Error getting stored text from Excel:', error);
    throw error;
  }
}


function findBestMatch(generatedResponse, storedEmbeddings) {
  let bestMatch = null;
  let maxSimilarity = -1;

  if (!Array.isArray(generatedResponse)) {
    generatedResponse = [generatedResponse];
  }

  storedEmbeddings.forEach((storedEmbedding) => {
    if (!Array.isArray(storedEmbedding)) {
      storedEmbedding = [storedEmbedding];
    }

    const similarity = calculateCosineSimilarity(generatedResponse, storedEmbedding);

    if (similarity > maxSimilarity) {
      maxSimilarity = similarity;
      bestMatch = storedEmbedding;
    }
  });

  return bestMatch;
}

async function getDomainSpecificResponse(query, storedEmbeddings) {
  console.log('Query:', query);

  try {
    // Get embeddings for the input query
    const queryEmbeddings = await getEmbeddingsForText(query);

    // Compare the query embeddings with stored embeddings
    const bestMatch = findBestMatch(queryEmbeddings, storedEmbeddings);

    if (bestMatch) {
      console.log('Domain-specific match found:', bestMatch);

      // Find the index of the best match in storedEmbeddings
      const bestMatchIndex = storedEmbeddings.findIndex(embedding => JSON.stringify(embedding) === JSON.stringify(bestMatch));
      console.log('bestMatchIndex: ', bestMatchIndex);
      // Use the index to get the corresponding text
      const storedText = await getStoredTextFromExcel(bestMatchIndex + 2); // Add 2 to skip the header row
      console.log('Respective Text:', storedText);

      // return { embedding: bestMatch, text: storedText };
      return storedText;
    } else {
      console.log('No domain-specific match found. Returning default response.');
      return { embedding: null, text: 'Default Response' }; // You can replace this with any default response
    }
  } catch (error) {
    console.error('Error getting domain-specific response:', error);
    throw error;
  }
}




async function getEmbeddingsForText(text) {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/embeddings',
      {
        model: "text-embedding-ada-002",
        input: [text],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );

    const embeddings = response.data.data[0].embedding;
    return embeddings;
  } catch (error) {
    console.error('Error getting embeddings for text:', error);
    throw error;
  }
}

app.post('/openai-response', upload.single('pdf'), async (req, res) => {
  try {
    const { query } = req.body;
    console.log("Q1: ");
    console.log(query);
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (!req.file) {
      throw new Error('No PDF file uploaded');
    }

    const pdfBuffer = req.file.buffer;
    const pdfData = await pdf(pdfBuffer);
    const pdfContent = pdfData.text;

    console.log('pdfContent: ', pdfContent);

    const pdfEmbeddings = await getEmbeddingsFromOpenAI(pdfContent);

    // console.log('pdfEmbeddings: ', pdfEmbeddings);
    await storeEmbeddingsInExcel(pdfContent, pdfEmbeddings);

    const storedEmbeddings = await getStoredEmbeddingsFromExcel();
    const domainSpecificResponse = await getDomainSpecificResponse(query, storedEmbeddings);
    res.json({ message: domainSpecificResponse });
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
