const axios = require('axios');
const cheerio = require('cheerio');
const player = require('play-sound')();
const fs = require('fs');

// Function to fetch the HTML content of the specified URL
async function fetchHTML(url) {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching the HTML:", error);
    return null;
  }
}

// Function to scrape the table and extract the rows following the row containing "Latest Contribute"
function scrapeTable(html) {
  const $ = cheerio.load(html);
  const table = $('table').first(); // Select the first table
  const rows = table.find('tr');
  const numRows = rows.length;

  // If there's no row or only header row, return error message
  if (numRows <= 1) {
    return "No rows with values found.";
  }

  // Extract content from the first row with values into an array
  const firstRowWithData = rows.eq(1); // Index 1 corresponds to the first row after the header row
  const rowValues = firstRowWithData.find('td').map((index, element) => $(element).text().trim()).get();
  return rowValues;
}

// Function to read the content of a file
function readFileContent(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error("Error reading file:", error);
    return null;
  }
}

// Function to write content to a file
function writeFileContent(filePath, content) {
  try {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`File '${filePath}' updated successfully.`);
  } catch (error) {
    console.error("Error writing file:", error);
  }
}

// URL to scrape
const url = 'https://polkadot.subscan.io/crowdloan_contribute?page=1&fund_id=3370-90';

function scrapePeriodically() {
  fetchHTML(url)
    .then(html => {
      if (html) {

        const rowContent = scrapeTable(html);
        console.log(`[${new Date()}] - Row content: ${rowContent}`);

        // Read the content of 'last.txt' file
        const filePath = 'last.txt';
        const fileContent = readFileContent(filePath);

        // Check if the content is equal to "1", if not replace it with "2"
        if (fileContent !== rowContent[0]) {
          console.log("more DOT!");
          writeFileContent(filePath, rowContent[0]);
          player.play('./coin-payout-slot-machine.mp3', (err) => {
            if (err) console.error("Error playing sound:", err);
          });
        }
      }
    })
    .catch(error => {
      console.error("Error:", error);
    });
}

// Fetch HTML content and scrape the table initially
scrapePeriodically();

// Schedule fetch and scrape every minute
setInterval(scrapePeriodically, 100 * 1000); // 60 * 1000 milliseconds = 1 minute
