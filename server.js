import express from "express";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import open from 'open';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.static("public"));

// Read word list once when server starts
const fileContents = readFileSync("./5letters.txt", "utf8");
const wordList = fileContents.split("\n");

function findWordsWithLetters(
  lettersToSearch,
  lettersToExclude,
  wordRegEx,
  wordList
) {
  const searchSet = new Set(
    lettersToSearch.split("").map((letter) => letter.trim())
  );
  const excludeSet = new Set(
    lettersToExclude.split("").map((letter) => letter.trim())
  );
  const regex = new RegExp("^" + wordRegEx + "$");

  // Use Set to automatically remove duplicates
  const uniqueWords = new Set(
    wordList.filter((word) => {
      if (word.length !== 5 || !word.match(regex)) {
        return false;
      }

      const wordLetters = new Set(word.split(""));
      const containsAllLetters = [...searchSet].every((letter) =>
        wordLetters.has(letter)
      );
      const containsExcludedLetters = [...excludeSet].some((letter) =>
        wordLetters.has(letter)
      );

      return containsAllLetters && !containsExcludedLetters;
    })
  );

  // Convert Set back to array
  return Array.from(uniqueWords);
}

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post("/api/find-words", (req, res) => {
  const { lettersToSearch, lettersToExclude, wordRegEx } = req.body;

  try {
    const words = findWordsWithLetters(
      lettersToSearch,
      lettersToExclude,
      wordRegEx,
      wordList
    );
    res.json({ words });
  } catch (error) {
    res.status(500).json({ error: "An error occurred while finding words" });
  }
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  open(`http://localhost:${PORT}`);
});

// Обработка корректного завершения
process.on("SIGTERM", () => {
  console.log("\nReceived SIGTERM. Performing graceful shutdown...");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("\nReceived SIGINT. Performing graceful shutdown...");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});
