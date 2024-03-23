import inquirer from "inquirer";
import { readFileSync } from "fs";

const fileContents = readFileSync("./5letters.txt", "utf8");
const wordList = fileContents.split("\n");

async function main() {
  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "lettersToSearch",
      message: "Есть буквы:",
    },
    {
      type: "input",
      name: "lettersToExclude",
      message: "Нет букв:",
    },
    {
      type: "input",
      name: "wordRegEx",
      message: "Регулярное выражение:",
      default: ".*",
    },
  ]);

  const lettersToSearch = new Set(
    answers.lettersToSearch.split("").map(letter => letter.trim())
  );
  const lettersToExclude = new Set(
    answers.lettersToExclude.split("").map(letter => letter.trim())
  );
  const wordRegEx = new RegExp("^" + answers.wordRegEx + "$");

  const result = findWordsWithLetters(
    lettersToSearch,
    lettersToExclude,
    wordRegEx,
    wordList
  );
  console.log("Возможные слова:");
  console.log(result);
}

function findWordsWithLetters(
  lettersToSearch,
  lettersToExclude,
  wordRegEx,
  wordList
) {
  return wordList.filter(word => {
    if (word.length !== 5 || !word.match(wordRegEx)) {
      return false;
    }

    const wordLetters = new Set(word.split(""));
    const containsAllLetters = [...lettersToSearch].every(letter =>
      wordLetters.has(letter)
    );
    const containsExcludedLetters = [...lettersToExclude].some(letter =>
      wordLetters.has(letter)
    );

    return containsAllLetters && !containsExcludedLetters;
  });
}

main();
