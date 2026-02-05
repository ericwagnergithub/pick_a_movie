// fetch_metadata.mjs
// Fetches rich metadata from TMDB API for all movies in our list

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===== CONFIGURATION =====

const TMDB_API_KEY = process.env.TMDB_API_KEY || "";
const MOVIES_FILE = path.join(__dirname, "movies.js");
const OUTPUT_FILE = path.join(__dirname, "movie_metadata.js");
const CACHE_FILE = path.join(__dirname, ".metadata_cache.json");

// Rate limiting
const REQUESTS_PER_SECOND = 4; // TMDB allows ~40 requests per 10 seconds
const DELAY_MS = 1000 / REQUESTS_PER_SECOND;

// Batch processing
const SAVE_INTERVAL = 50; // Save progress every N movies

// ===== HELPERS =====

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function loadMovies() {
  console.log("📖 Loading movies from movies.js...");
  const content = fs.readFileSync(MOVIES_FILE, "utf8");

  // Extract MOVIES array from the file
  const match = content.match(/const MOVIES = (\[[\s\S]*?\]);/);
  if (!match) {
    throw new Error("Could not parse MOVIES array from movies.js");
  }

  const movies = JSON.parse(match[1]);
  console.log(`✓ Loaded ${movies.length} movies`);
  return movies;
}

function loadCache() {
  if (fs.existsSync(CACHE_FILE)) {
    console.log("💾 Loading cached data...");
    const cache = JSON.parse(fs.readFileSync(CACHE_FILE, "utf8"));
    console.log(`✓ Found ${Object.keys(cache).length} cached movies`);
    return cache;
  }
  return {};
}

function saveCache(cache) {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
}

async function searchMovie(title, year) {
  const url = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
    title
  )}&year=${year}&language=en-US`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.results[0] || null; // Return first match
}

async function getMovieDetails(tmdbId) {
  const url = `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${TMDB_API_KEY}&append_to_response=watch/providers,credits&language=en-US`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

async function fetchMovieMetadata(movie) {
  try {
    // Search for the movie
    const searchResult = await searchMovie(movie.title, movie.year);

    if (!searchResult) {
      console.log(`   ⚠️  No match found: ${movie.title} (${movie.year})`);
      return null;
    }

    await delay(DELAY_MS);

    // Get detailed info
    const details = await getMovieDetails(searchResult.id);

    // Extract streaming providers (US only)
    const providers = details["watch/providers"]?.results?.US || {};
    const streamingOn = [];

    if (providers.flatrate) {
      streamingOn.push(...providers.flatrate.map((p) => p.provider_name));
    }

    // Extract top cast (first 5)
    const cast = details.credits?.cast?.slice(0, 5).map((c) => c.name) || [];

    // Build metadata object
    return {
      tmdbId: details.id,
      poster: details.poster_path
        ? `https://image.tmdb.org/t/p/w500${details.poster_path}`
        : null,
      backdrop: details.backdrop_path
        ? `https://image.tmdb.org/t/p/w1280${details.backdrop_path}`
        : null,
      rating: details.vote_average || null,
      voteCount: details.vote_count || 0,
      overview: details.overview || "",
      runtime: details.runtime || null,
      releaseDate: details.release_date || "",
      streamingOn: streamingOn,
      cast: cast,
      director: details.credits?.crew?.find((c) => c.job === "Director")?.name || "",
    };
  } catch (error) {
    console.log(`   ❌ Error: ${movie.title} - ${error.message}`);
    return null;
  }
}

// ===== MAIN FUNCTION =====

async function main() {
  console.log("\n🎬 TMDB Metadata Fetcher\n");

  // Check API key
  if (!TMDB_API_KEY) {
    console.error("❌ Error: TMDB_API_KEY not found!");
    console.error("\nUsage:");
    console.error("  TMDB_API_KEY=your_key_here node fetch_metadata.mjs\n");
    process.exit(1);
  }

  // Load movies
  const movies = loadMovies();
  const cache = loadCache();

  const metadata = {};
  let processed = 0;
  let found = 0;
  let notFound = 0;
  let cached = 0;

  console.log(`\n🔍 Fetching metadata for ${movies.length} movies...\n`);

  for (const movie of movies) {
    processed++;

    // Check cache first
    if (cache[movie.id]) {
      metadata[movie.id] = cache[movie.id];
      cached++;

      if (processed % 10 === 0) {
        process.stdout.write(`\r📊 Progress: ${processed}/${movies.length} (${cached} cached, ${found} fetched, ${notFound} not found)`);
      }
      continue;
    }

    // Fetch from API
    console.log(`\n[${processed}/${movies.length}] ${movie.title} (${movie.year})`);

    const meta = await fetchMovieMetadata(movie);

    if (meta) {
      metadata[movie.id] = meta;
      found++;
      console.log(`   ✓ Found! Rating: ${meta.rating?.toFixed(1) || "N/A"}, Poster: ${meta.poster ? "✓" : "✗"}`);
    } else {
      notFound++;
    }

    // Save progress periodically
    if (processed % SAVE_INTERVAL === 0) {
      console.log(`\n💾 Saving progress...`);
      saveCache(metadata);
    }

    // Rate limiting delay
    await delay(DELAY_MS);
  }

  console.log(`\n\n✅ Fetch complete!`);
  console.log(`   Total: ${processed}`);
  console.log(`   Found: ${found}`);
  console.log(`   Cached: ${cached}`);
  console.log(`   Not found: ${notFound}`);

  // Save final cache
  console.log(`\n💾 Saving cache...`);
  saveCache(metadata);

  // Generate output file
  console.log(`📝 Generating ${OUTPUT_FILE}...`);

  const output = `// movie_metadata.js
// TMDB metadata for all movies
// Auto-generated by fetch_metadata.mjs
// Last updated: ${new Date().toISOString()}

const MOVIE_METADATA = ${JSON.stringify(metadata, null, 2)};
`;

  fs.writeFileSync(OUTPUT_FILE, output, "utf8");

  console.log(`\n✅ Done! Metadata saved to ${OUTPUT_FILE}`);
  console.log(`📦 File size: ${(fs.statSync(OUTPUT_FILE).size / 1024 / 1024).toFixed(2)} MB\n`);

  // Show sample
  const sampleId = Object.keys(metadata)[0];
  if (sampleId) {
    console.log("📋 Sample metadata:");
    console.log(JSON.stringify(metadata[sampleId], null, 2));
  }
}

// Run
main().catch((error) => {
  console.error("\n❌ Fatal error:", error);
  process.exit(1);
});
