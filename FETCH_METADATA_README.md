# TMDB Metadata Fetcher

This script fetches rich movie metadata from TMDB API for all 1000 movies in our list.

## Prerequisites

1. **Get a free TMDB API key**:
   - Sign up at https://www.themoviedb.org/signup
   - Go to Settings → API → Request API Key
   - Choose "Developer" option
   - Fill out the form (use "Personal" for type, any URL for website)
   - Copy your API key (v3 auth)

2. **Ensure Node.js is installed** (v14 or higher)

## Usage

### Run the script

```bash
TMDB_API_KEY=your_api_key_here node fetch_metadata.mjs
```

**Windows (PowerShell):**
```powershell
$env:TMDB_API_KEY="your_api_key_here"; node fetch_metadata.mjs
```

**Windows (Command Prompt):**
```cmd
set TMDB_API_KEY=your_api_key_here && node fetch_metadata.mjs
```

### What it does

1. Reads all 1000 movies from `movies.js`
2. For each movie:
   - Searches TMDB by title and year
   - Fetches detailed metadata
   - Includes poster, rating, overview, cast, streaming availability
3. Saves results to `movie_metadata.js`
4. Caches progress in `.metadata_cache.json`

### Features

- **Rate limiting**: Respects TMDB API limits (4 requests/second)
- **Progress saving**: Saves every 50 movies (resume if interrupted)
- **Caching**: Already-fetched movies are skipped
- **Error handling**: Continues if a movie fails

### Expected runtime

- ~5-10 minutes for all 1000 movies (depending on internet speed)
- Can be interrupted and resumed (uses cache)

### Output

Generates `movie_metadata.js` with data like:

```javascript
{
  "the-shawshank-redemption-1994": {
    "tmdbId": 278,
    "poster": "https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg",
    "rating": 8.7,
    "voteCount": 24000,
    "overview": "Two imprisoned men bond over a number of years...",
    "runtime": 142,
    "releaseDate": "1994-09-23",
    "streamingOn": ["Netflix", "Hulu"],
    "cast": ["Tim Robbins", "Morgan Freeman", ...],
    "director": "Frank Darabont"
  }
}
```

## Troubleshooting

### "TMDB_API_KEY not found"
Make sure you're setting the environment variable correctly for your OS.

### "TMDB API error: 401"
Your API key is invalid. Check that you copied it correctly.

### "TMDB API error: 429"
Rate limit exceeded. The script already includes delays, but you might need to wait a bit.

### Interrupted?
Just run the script again - it will resume from the cache.

### Want to re-fetch everything?
Delete `.metadata_cache.json` and run again.

## After fetching

1. Commit `movie_metadata.js` to the repo
2. Delete `.metadata_cache.json` (not needed in repo)
3. Update the app to use the metadata

## Metadata fields

| Field | Description |
|-------|-------------|
| `tmdbId` | TMDB movie ID |
| `poster` | Poster image URL (500px wide) |
| `backdrop` | Backdrop image URL (1280px wide) |
| `rating` | Average rating (0-10) |
| `voteCount` | Number of votes |
| `overview` | Plot summary |
| `runtime` | Runtime in minutes |
| `releaseDate` | Release date (YYYY-MM-DD) |
| `streamingOn` | Array of streaming services (US) |
| `cast` | Top 5 cast members |
| `director` | Director name |

## Notes

- Streaming availability is US-only (TMDB limitation)
- Not all movies will have all fields (some may be missing posters, etc.)
- The script logs which movies couldn't be found
- Final file size is ~2-3 MB (acceptable for web delivery)
