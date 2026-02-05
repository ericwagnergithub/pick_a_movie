// generate_movies.mjs
// Converts your Kaggle Top 1000 CSV into movies.js with stable slug IDs

import fs from "fs";

// ---- Config ----
const INPUT_CSV = "top_1000.csv";   // your Kaggle CSV
const OUTPUT_JS = "movies.js";

// Safer CSV parser for quoted fields
function parseCsvLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result.map(c => c.trim());
}

// Slug generator (stable ID)
function makeSlugId(title, year) {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") +
    "-" +
    year
  );
}

function main() {
  const csv = fs.readFileSync(INPUT_CSV, "utf8");
  const lines = csv.split(/\r?\n/).filter(Boolean);

  const header = parseCsvLine(lines[0]);

  const col = (name) => header.indexOf(name);

  const titleIndex = col("Series_Title");
  const yearIndex = col("Released_Year");
  const genreIndex = col("Genre");

  if (titleIndex === -1 || yearIndex === -1 || genreIndex === -1) {
    console.error("Required columns not found.");
    console.error(header);
    process.exit(1);
  }

  const movies = [];

  for (let i = 1; i < lines.length; i++) {
    const row = parseCsvLine(lines[i]);

    const title = row[titleIndex];
    const year = Number(row[yearIndex]) || null;
    const genreRaw = row[genreIndex];

    if (!title || !year) continue;

    const genres = genreRaw
      ? genreRaw.split(",").map(g => g.trim())
      : [];

    const id = makeSlugId(title, year);

    movies.push({
      id,
      title,
      year,
      genres
    });
  }

  console.log(`Parsed ${movies.length} movies`);

  const jsOut =
    "// movies.js - auto-generated from Kaggle Top 1000\n" +
    "// Stable slug IDs based on title + year\n\n" +
    "const MOVIES = " +
    JSON.stringify(movies, null, 2) +
    ";\n";

  fs.writeFileSync(OUTPUT_JS, jsOut, "utf8");
  console.log(`Wrote ${OUTPUT_JS}`);
}

main();
