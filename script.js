// script.js

// --- Persistence ---

const STORAGE_KEY = "pick_a_movie_state_v1";

let state = {
  // classifications[id] = "watchlist" | "seen" | "not_interested"
  classifications: {},
  // ranking arrays hold movie IDs in preference order
  rankingWatchlist: [],
  rankingSeen: [],
  // comparisonCounts[id] = number of times this movie was compared
  comparisonCounts: {},
  // comparedPairs[mode][pairKey] = true (tracks which pairs have been compared)
  comparedPairs: {
    watchlist: {},
    seen: {}
  }
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      if (parsed.classifications && typeof parsed.classifications === "object") {
        state.classifications = parsed.classifications;
      }
      if (Array.isArray(parsed.rankingWatchlist)) {
        state.rankingWatchlist = parsed.rankingWatchlist;
      }
      if (Array.isArray(parsed.rankingSeen)) {
        state.rankingSeen = parsed.rankingSeen;
      }
      if (parsed.comparisonCounts && typeof parsed.comparisonCounts === "object") {
        state.comparisonCounts = parsed.comparisonCounts;
      }
      if (parsed.comparedPairs && typeof parsed.comparedPairs === "object") {
        state.comparedPairs = parsed.comparedPairs;
      }
    }
  } catch (err) {
    console.warn("Failed to load state:", err);
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error("Failed to save state:", err);

    // Check if it's a quota exceeded error
    if (err.name === "QuotaExceededError" || err.code === 22) {
      alert(
        "⚠️ Browser storage is full!\n\n" +
        "Your data couldn't be saved. Please:\n" +
        "1. Export your data (to back it up)\n" +
        "2. Clear some browser data\n" +
        "3. Or use a different browser"
      );
    } else {
      alert(
        "⚠️ Couldn't save your data.\n\n" +
        "Error: " + err.message + "\n\n" +
        "Try exporting your data to back it up."
      );
    }
  }
}

function exportStateToFile() {
  const payload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    state
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json"
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "pick_a_movie_data.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function importStateFromFile(file) {
  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const text = event.target.result;
      const parsed = JSON.parse(text);

      if (!parsed || typeof parsed !== "object" || !parsed.state) {
        alert("This file doesn't look like Pick A Movie data.");
        return;
      }

      const importedState = parsed.state;

      // Basic shape check
      if (
        !importedState.classifications ||
        typeof importedState.classifications !== "object" ||
        !Array.isArray(importedState.rankingWatchlist) ||
        !Array.isArray(importedState.rankingSeen)
      ) {
        alert("Imported data is missing required fields.");
        return;
      }

      // Ensure comparisonCounts exists (for backward compatibility)
      if (!importedState.comparisonCounts || typeof importedState.comparisonCounts !== "object") {
        importedState.comparisonCounts = {};
      }

      // Ensure comparedPairs exists (for backward compatibility)
      if (!importedState.comparedPairs || typeof importedState.comparedPairs !== "object") {
        importedState.comparedPairs = {
          watchlist: {},
          seen: {}
        };
      }

      state = importedState;
      saveState();
      recomputeStats();
      alert("Data imported successfully!");
    } catch (err) {
      console.error("Failed to import data:", err);
      alert("There was a problem reading that file.");
    }
  };

  reader.readAsText(file);
}


// --- DOM elements ---

const screenMainMenu = document.getElementById("screen-main-menu");
const screenDiscovery = document.getElementById("screen-discovery");
const screenRanking = document.getElementById("screen-ranking");
const screenSettings = document.getElementById("screen-settings");
const onboardingCard = document.getElementById("onboarding-card");

// Main menu buttons + stats
const btnStartDiscovery = document.getElementById("btn-start-discovery");
const btnRankWatchlist = document.getElementById("btn-rank-watchlist");
const btnRankSeen = document.getElementById("btn-rank-seen");
const statWatchlistCount = document.getElementById("stat-watchlist-count");
const statSeenCount = document.getElementById("stat-seen-count");
const statNotInterestedCount = document.getElementById(
  "stat-not-interested-count"
);
const statUnreviewedCount = document.getElementById("stat-unreviewed-count");

const btnExportData = document.getElementById("btn-export-data");
const btnImportData = document.getElementById("btn-import-data");
const importFileInput = document.getElementById("import-file-input");
const btnSettings = document.getElementById("btn-settings");

// Settings elements
const btnSettingsBack = document.getElementById("btn-settings-back");
const btnClearWatchlistRankings = document.getElementById("btn-clear-watchlist-rankings");
const btnClearSeenRankings = document.getElementById("btn-clear-seen-rankings");

// Discovery elements
const btnDiscoveryBack = document.getElementById("btn-discovery-back");
const discoveryProgress = document.getElementById("discovery-progress");
const discoveryMovieTitle = document.getElementById("discovery-movie-title");
const discoveryPoster = document.getElementById("discovery-poster");
const discoveryMovieMeta = document.getElementById("discovery-movie-meta");
const discoveryMovieOverview = document.getElementById("discovery-movie-overview");
const discoveryMovieCredits = document.getElementById("discovery-movie-credits");
const discoveryEmptyMessage = document.getElementById("discovery-empty-message");
const btnDiscoverySeen = document.getElementById("btn-discovery-seen");
const btnDiscoveryWatchlist = document.getElementById(
  "btn-discovery-watchlist"
);
const btnDiscoveryNotInterested = document.getElementById(
  "btn-discovery-not-interested"
);
const btnDiscoverySkip = document.getElementById("btn-discovery-skip");

// Ranking elements
const rankingTitle = document.getElementById("ranking-title");
const rankingDescription = document.getElementById("ranking-description");
const btnRankingBack = document.getElementById("btn-ranking-back");
const rankLeftTitle = document.getElementById("rank-left-title");
const rankRightTitle = document.getElementById("rank-right-title");
const rankLeftPoster = document.getElementById("rank-left-poster");
const rankRightPoster = document.getElementById("rank-right-poster");
const rankLeftMeta = document.getElementById("rank-left-meta");
const rankRightMeta = document.getElementById("rank-right-meta");
const rankLeftCredits = document.getElementById("rank-left-credits");
const rankRightCredits = document.getElementById("rank-right-credits");
const btnRankLeft = document.getElementById("btn-rank-left");
const btnRankRight = document.getElementById("btn-rank-right");
const rankingListEl = document.getElementById("ranking-list");
const rankingEmptyMessage = document.getElementById("ranking-empty-message");
const rankingPairArea = document.getElementById("ranking-pair-area");

// --- Screen helpers ---

function showScreen(name) {
  const screens = [screenMainMenu, screenDiscovery, screenRanking, screenSettings];
  screens.forEach((s) => s.classList.add("hidden"));

  switch (name) {
    case "main":
      screenMainMenu.classList.remove("hidden");
      break;
    case "discovery":
      screenDiscovery.classList.remove("hidden");
      break;
    case "ranking":
      screenRanking.classList.remove("hidden");
      break;
    case "settings":
      screenSettings.classList.remove("hidden");
      break;
  }
}

// --- Stats ---

function recomputeStats() {
  let watchlistCount = 0;
  let seenCount = 0;
  let notInterestedCount = 0;

  MOVIES.forEach((movie) => {
    const c = state.classifications[movie.id];
    if (c === "watchlist") watchlistCount++;
    else if (c === "seen") seenCount++;
    else if (c === "not_interested") notInterestedCount++;
  });

  const unreviewedCount =
    MOVIES.length - (watchlistCount + seenCount + notInterestedCount);

  statWatchlistCount.textContent = watchlistCount;
  statSeenCount.textContent = seenCount;
  statNotInterestedCount.textContent = notInterestedCount;
  statUnreviewedCount.textContent = unreviewedCount;

  // Hide onboarding card after user has classified at least 5 movies
  const totalClassified = watchlistCount + seenCount + notInterestedCount;
  if (onboardingCard) {
    if (totalClassified >= 5) {
      onboardingCard.style.display = "none";
    } else {
      onboardingCard.style.display = "block";
    }
  }
}

// --- Discovery Queue ---

const DISCOVERY_BATCH_SIZE = 10;
let currentBatch = [];
let currentBatchIndex = 0;

function getUnreviewedMovies() {
  return MOVIES.filter((m) => !state.classifications[m.id]);
}

function buildDiscoveryBatch() {
  const unreviewed = getUnreviewedMovies();
  currentBatch = unreviewed.slice(0, DISCOVERY_BATCH_SIZE).map((m) => m.id);
  currentBatchIndex = 0;
}

function startDiscovery() {
  buildDiscoveryBatch();
  showScreen("discovery");
  renderDiscovery();
}

function renderDiscovery() {
  if (currentBatch.length === 0) {
    // No more movies to review
    discoveryMovieTitle.textContent = "";
    discoveryProgress.textContent = "";
    discoveryEmptyMessage.textContent =
      "You've reviewed all the movies in this list for now. You can still rank your Watchlist or Seen movies from the main menu.";
    setDiscoveryButtonsEnabled(false);
    return;
  }

  if (currentBatchIndex >= currentBatch.length) {
    // Finished this batch
    discoveryMovieTitle.textContent = "Batch complete!";
    discoveryProgress.textContent = "";
    discoveryEmptyMessage.textContent =
      "Nice work. This Discovery Queue batch is done. Head back to the main menu or start another batch.";
    setDiscoveryButtonsEnabled(false);
    return;
  }

  const movieId = currentBatch[currentBatchIndex];
  const movie = MOVIES.find((m) => m.id === movieId);
  const metadata = MOVIE_METADATA?.[movieId];

  // Update title
  discoveryMovieTitle.textContent = movie ? movie.title : "Unknown movie";

  // Update poster
  if (metadata?.poster) {
    discoveryPoster.src = metadata.poster;
    discoveryPoster.alt = `${movie?.title || "Movie"} poster`;
    discoveryPoster.classList.remove("hidden");
  } else {
    discoveryPoster.classList.add("hidden");
  }

  // Update metadata (rating, year, genres)
  const metaParts = [];
  if (metadata?.rating) {
    metaParts.push(`<span class="movie-rating">★ ${metadata.rating.toFixed(1)}</span>`);
  }
  if (movie?.year) {
    metaParts.push(`<span class="movie-year">${movie.year}</span>`);
  }
  if (movie?.genres) {
    metaParts.push(`<span class="movie-genres">${movie.genres}</span>`);
  }
  discoveryMovieMeta.innerHTML = metaParts.join("");

  // Update overview
  if (metadata?.overview) {
    discoveryMovieOverview.textContent = metadata.overview;
    discoveryMovieOverview.style.display = "block";
  } else {
    discoveryMovieOverview.style.display = "none";
  }

  // Update credits (cast and director)
  const creditsParts = [];
  if (metadata?.director) {
    creditsParts.push(`<strong>Director:</strong> ${metadata.director}`);
  }
  if (metadata?.cast && metadata.cast.length > 0) {
    creditsParts.push(`<strong>Cast:</strong> ${metadata.cast.join(", ")}`);
  }
  if (creditsParts.length > 0) {
    discoveryMovieCredits.innerHTML = creditsParts.join("<br>");
    discoveryMovieCredits.style.display = "block";
  } else {
    discoveryMovieCredits.style.display = "none";
  }

  discoveryProgress.textContent = `Movie ${currentBatchIndex + 1} of ${
    currentBatch.length
  } in this batch`;
  discoveryEmptyMessage.textContent = "";
  setDiscoveryButtonsEnabled(true);
}

function setDiscoveryButtonsEnabled(enabled) {
  btnDiscoverySeen.disabled = !enabled;
  btnDiscoveryWatchlist.disabled = !enabled;
  btnDiscoveryNotInterested.disabled = !enabled;
  btnDiscoverySkip.disabled = !enabled;
}

function classifyCurrentMovie(category) {
  if (currentBatch.length === 0 || currentBatchIndex >= currentBatch.length) {
    return;
  }

  const movieId = currentBatch[currentBatchIndex];
  state.classifications[movieId] = category;

  // Keep ranking lists in sync with classifications
  syncRankingArraysForClassificationChange(movieId, category);

  saveState();
  recomputeStats();

  currentBatchIndex++;
  renderDiscovery();
}

function skipCurrentMovie() {
  if (currentBatch.length === 0 || currentBatchIndex >= currentBatch.length) {
    return;
  }

  // Do NOT set any classification; just move on.
  currentBatchIndex++;
  renderDiscovery();
}


// --- Ranking ---

// "watchlist" mode looks at classifications == "watchlist"
// "seen" mode looks at classifications == "seen"
let currentRankingMode = null;
let currentLeftId = null;
let currentRightId = null;

function getIdsForMode(mode) {
  const targetClassification = mode === "watchlist" ? "watchlist" : "seen";
  return MOVIES.filter(
    (m) => state.classifications[m.id] === targetClassification
  ).map((m) => m.id);
}

// Make sure ranking arrays only contain relevant IDs in a stable way
function ensureRankingArray(mode) {
  const ids = getIdsForMode(mode);
  let ranking =
    mode === "watchlist" ? state.rankingWatchlist : state.rankingSeen;

  // keep only those that still exist in ids
  ranking = ranking.filter((id) => ids.includes(id));

  // append any missing ids at the end
  ids.forEach((id) => {
    if (!ranking.includes(id)) {
      ranking.push(id);
    }
  });

  if (mode === "watchlist") {
    state.rankingWatchlist = ranking;
  } else {
    state.rankingSeen = ranking;
  }
}

function syncRankingArraysForClassificationChange(movieId, category) {
  // Remove ID from both ranking arrays first
  state.rankingWatchlist = state.rankingWatchlist.filter((id) => id !== movieId);
  state.rankingSeen = state.rankingSeen.filter((id) => id !== movieId);

  if (category === "watchlist") {
    state.rankingWatchlist.push(movieId);
  } else if (category === "seen") {
    state.rankingSeen.push(movieId);
  }

  saveState();
}

function startRanking(mode) {
  currentRankingMode = mode;
  ensureRankingArray(mode);

  const ids = getIdsForMode(mode);
  if (ids.length < 2) {
    // Not enough items to rank
    rankingPairArea.classList.add("hidden");
    rankingEmptyMessage.textContent =
      "You need at least 2 movies in this list to start ranking. Add more via the Discovery Queue first.";
  } else {
    rankingPairArea.classList.remove("hidden");
    rankingEmptyMessage.textContent = "";
  }

  if (mode === "watchlist") {
    rankingTitle.textContent = "Rank your Watchlist";
    rankingDescription.textContent =
      "Which movie would you rather watch next? Keep picking and we’ll build your watchlist order.";
  } else {
    rankingTitle.textContent = "Rank your Seen Movies";
    rankingDescription.textContent =
      "Which movie do you like more? Keep picking to build your all-time ranking.";
  }

  showScreen("ranking");
  renderRankingList();
  pickNextPair();
}

function renderRankingList() {
  const ranking =
    currentRankingMode === "watchlist"
      ? state.rankingWatchlist
      : state.rankingSeen;

  // Sort by comparison count (votes) in descending order
  const sortedRanking = [...ranking].sort((idA, idB) => {
    const countA = state.comparisonCounts[idA] || 0;
    const countB = state.comparisonCounts[idB] || 0;
    return countB - countA; // Descending order
  });

  rankingListEl.innerHTML = "";
  sortedRanking.forEach((id, index) => {
    const movie = MOVIES.find((m) => m.id === id);
    if (!movie) return;
    const metadata = MOVIE_METADATA?.[id];
    const li = document.createElement("li");
    const count = state.comparisonCounts[id] || 0;

    // Create movie info container
    const infoDiv = document.createElement("div");
    infoDiv.className = "ranking-movie-info";

    // Create movie title element
    const titleSpan = document.createElement("div");
    titleSpan.textContent = movie.title;
    titleSpan.className = "ranking-movie-title";
    infoDiv.appendChild(titleSpan);

    // Add streaming availability if available
    if (metadata?.streamingOn && metadata.streamingOn.length > 0) {
      const streamingDiv = document.createElement("div");
      streamingDiv.className = "ranking-movie-streaming";
      const streamingBadges = metadata.streamingOn.slice(0, 3).map(service =>
        `<span class="streaming-badge">${service}</span>`
      ).join(" ");
      streamingDiv.innerHTML = `<strong>Streaming:</strong> ${streamingBadges}`;
      infoDiv.appendChild(streamingDiv);
    }

    // Create comparison count badge
    const countSpan = document.createElement("span");
    countSpan.textContent = count > 0 ? `${count} votes` : "not yet compared";
    countSpan.className = "ranking-comparison-count";

    li.appendChild(infoDiv);
    li.appendChild(countSpan);
    rankingListEl.appendChild(li);
  });
}

// Helper function to create a unique pair key (sorted IDs)
function getPairKey(id1, id2) {
  return id1 < id2 ? `${id1}_${id2}` : `${id2}_${id1}`;
}

function pickNextPair() {
  const ranking =
    currentRankingMode === "watchlist"
      ? state.rankingWatchlist
      : state.rankingSeen;

  if (!ranking || ranking.length < 2) {
    rankingPairArea.classList.add("hidden");
    rankingEmptyMessage.textContent =
      "You need at least 2 movies in this list to start ranking.";
    return;
  }

  const comparedPairs = state.comparedPairs[currentRankingMode];
  const n = ranking.length;

  // Try to find an uncompared pair
  let attempts = 0;
  const maxAttempts = n * n; // Try up to n^2 times
  let foundPair = false;

  while (attempts < maxAttempts && !foundPair) {
    let leftIndex = Math.floor(Math.random() * n);
    let rightIndex = Math.floor(Math.random() * n);

    // Skip if same movie
    if (leftIndex === rightIndex) {
      attempts++;
      continue;
    }

    const leftId = ranking[leftIndex];
    const rightId = ranking[rightIndex];
    const pairKey = getPairKey(leftId, rightId);

    // Check if this pair has already been compared
    if (!comparedPairs[pairKey]) {
      currentLeftId = leftId;
      currentRightId = rightId;
      foundPair = true;
    }

    attempts++;
  }

  // If no uncompared pairs found, show message
  if (!foundPair) {
    rankingPairArea.classList.add("hidden");
    rankingEmptyMessage.textContent =
      "You've compared all possible pairs! Your ranking is complete. You can reset comparisons or go back to the main menu.";
    return;
  }

  rankingPairArea.classList.remove("hidden");
  rankingEmptyMessage.textContent = "";

  const leftMovie = MOVIES.find((m) => m.id === currentLeftId);
  const rightMovie = MOVIES.find((m) => m.id === currentRightId);
  const leftMetadata = MOVIE_METADATA?.[currentLeftId];
  const rightMetadata = MOVIE_METADATA?.[currentRightId];

  // Update titles
  rankLeftTitle.textContent = leftMovie ? leftMovie.title : "Unknown movie";
  rankRightTitle.textContent = rightMovie ? rightMovie.title : "Unknown movie";

  // Update left poster
  if (leftMetadata?.poster) {
    rankLeftPoster.src = leftMetadata.poster;
    rankLeftPoster.alt = `${leftMovie?.title || "Movie"} poster`;
    rankLeftPoster.classList.remove("hidden");
  } else {
    rankLeftPoster.classList.add("hidden");
  }

  // Update right poster
  if (rightMetadata?.poster) {
    rankRightPoster.src = rightMetadata.poster;
    rankRightPoster.alt = `${rightMovie?.title || "Movie"} poster`;
    rankRightPoster.classList.remove("hidden");
  } else {
    rankRightPoster.classList.add("hidden");
  }

  // Update left metadata
  const leftMetaParts = [];
  if (leftMetadata?.rating) {
    leftMetaParts.push(`★ ${leftMetadata.rating.toFixed(1)}`);
  }
  if (leftMovie?.year) {
    leftMetaParts.push(leftMovie.year);
  }
  rankLeftMeta.textContent = leftMetaParts.join(" • ");

  // Update right metadata
  const rightMetaParts = [];
  if (rightMetadata?.rating) {
    rightMetaParts.push(`★ ${rightMetadata.rating.toFixed(1)}`);
  }
  if (rightMovie?.year) {
    rightMetaParts.push(rightMovie.year);
  }
  rankRightMeta.textContent = rightMetaParts.join(" • ");

  // Update left credits
  const leftCreditsParts = [];
  if (leftMetadata?.director) {
    leftCreditsParts.push(`<strong>Dir:</strong> ${leftMetadata.director}`);
  }
  if (leftMetadata?.cast && leftMetadata.cast.length > 0) {
    leftCreditsParts.push(`<strong>Cast:</strong> ${leftMetadata.cast.slice(0, 3).join(", ")}`);
  }
  if (leftCreditsParts.length > 0) {
    rankLeftCredits.innerHTML = leftCreditsParts.join("<br>");
    rankLeftCredits.style.display = "block";
  } else {
    rankLeftCredits.style.display = "none";
  }

  // Update right credits
  const rightCreditsParts = [];
  if (rightMetadata?.director) {
    rightCreditsParts.push(`<strong>Dir:</strong> ${rightMetadata.director}`);
  }
  if (rightMetadata?.cast && rightMetadata.cast.length > 0) {
    rightCreditsParts.push(`<strong>Cast:</strong> ${rightMetadata.cast.slice(0, 3).join(", ")}`);
  }
  if (rightCreditsParts.length > 0) {
    rankRightCredits.innerHTML = rightCreditsParts.join("<br>");
    rankRightCredits.style.display = "block";
  } else {
    rankRightCredits.style.display = "none";
  }

}

function handleRankingChoice(winnerId, loserId) {
  const ranking =
    currentRankingMode === "watchlist"
      ? state.rankingWatchlist
      : state.rankingSeen;

  const winnerIndex = ranking.indexOf(winnerId);
  const loserIndex = ranking.indexOf(loserId);

  if (winnerIndex === -1 || loserIndex === -1) {
    pickNextPair();
    return;
  }

  // Mark this pair as compared
  const pairKey = getPairKey(winnerId, loserId);
  state.comparedPairs[currentRankingMode][pairKey] = true;

  // Increment comparison counts for both movies
  state.comparisonCounts[winnerId] = (state.comparisonCounts[winnerId] || 0) + 1;
  state.comparisonCounts[loserId] = (state.comparisonCounts[loserId] || 0) + 1;

  // If winner is currently lower than loser, move it just above loser
  if (winnerIndex > loserIndex) {
    ranking.splice(winnerIndex, 1);
    const newIndex = ranking.indexOf(loserId);
    ranking.splice(newIndex, 0, winnerId);
  }

  if (currentRankingMode === "watchlist") {
    state.rankingWatchlist = ranking;
  } else {
    state.rankingSeen = ranking;
  }

  saveState();
  renderRankingList();
  pickNextPair();
}

// --- Event listeners ---

function attachEventListeners() {
  // Main menu
  btnStartDiscovery.addEventListener("click", () => {
    startDiscovery();
  });

  btnRankWatchlist.addEventListener("click", () => {
    startRanking("watchlist");
  });

  btnRankSeen.addEventListener("click", () => {
    startRanking("seen");
  });

  
  // export / import
  btnExportData.addEventListener("click", () => {
    exportStateToFile();
  });

  btnImportData.addEventListener("click", () => {
    importFileInput.value = ""; // reset so selecting same file works
    importFileInput.click();
  });

  importFileInput.addEventListener("change", () => {
    const file = importFileInput.files && importFileInput.files[0];
    if (file) {
      importStateFromFile(file);
    }
  });

  // Settings
  btnSettings.addEventListener("click", () => {
    showScreen("settings");
  });

  btnSettingsBack.addEventListener("click", () => {
    showScreen("main");
  });

  btnClearWatchlistRankings.addEventListener("click", () => {
    clearRankings("watchlist");
  });

  btnClearSeenRankings.addEventListener("click", () => {
    clearRankings("seen");
  });


  // Discovery
  btnDiscoveryBack.addEventListener("click", () => {
    showScreen("main");
    recomputeStats();
  });

  btnDiscoverySeen.addEventListener("click", () => {
    classifyCurrentMovie("seen");
  });

  btnDiscoveryWatchlist.addEventListener("click", () => {
    classifyCurrentMovie("watchlist");
  });

  btnDiscoveryNotInterested.addEventListener("click", () => {
    classifyCurrentMovie("not_interested");
  });

    btnDiscoverySkip.addEventListener("click", () => {
    skipCurrentMovie();
  });


  // Ranking
  btnRankingBack.addEventListener("click", () => {
    showScreen("main");
    recomputeStats();
  });

  btnRankLeft.addEventListener("click", () => {
    if (currentLeftId && currentRightId) {
      handleRankingChoice(currentLeftId, currentRightId);
    }
  });

  btnRankRight.addEventListener("click", () => {
    if (currentLeftId && currentRightId) {
      handleRankingChoice(currentRightId, currentLeftId);
    }
  });
}

// --- Settings ---

function clearRankings(mode) {
  const listName = mode === "watchlist" ? "Watchlist" : "Seen Movies";
  const ranking = mode === "watchlist" ? state.rankingWatchlist : state.rankingSeen;

  if (ranking.length === 0) {
    alert(`You don't have any ${listName} to clear rankings for.`);
    return;
  }

  const confirmed = confirm(
    `Are you sure you want to clear all ranking comparisons for your ${listName}?\n\n` +
    `This will reset:\n` +
    `• All comparison history for ${listName}\n` +
    `• Comparison counts for movies in this list\n\n` +
    `Your ranking order will be preserved, but you can re-compare from scratch.`
  );

  if (!confirmed) return;

  // Clear compared pairs for this mode
  state.comparedPairs[mode] = {};

  // Clear comparison counts for movies in this ranking
  ranking.forEach(movieId => {
    delete state.comparisonCounts[movieId];
  });

  saveState();
  recomputeStats();

  alert(`${listName} ranking comparisons have been cleared! You can now re-rank from scratch.`);
}

// --- Init ---

document.addEventListener("DOMContentLoaded", () => {
  loadState();
  attachEventListeners();
  recomputeStats();
  showScreen("main");
});
