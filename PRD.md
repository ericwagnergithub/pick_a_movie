# Product Requirements Document: Pick A Movie

## Overview
Pick A Movie is a web application that helps users discover, organize, and decide what movies to watch. It combines a discovery queue interface with smart ranking to surface personalized movie recommendations.

**Version:** 2.0
**Last Updated:** 2026-02-04
**Status:** In Development

---

## Product Vision

### Goal
Create a shareable web app that anyone can use to build their personal movie watchlist and get quick recommendations on what to watch next.

### Target Audience
- Movie enthusiasts who have too many options and struggle with decision paralysis
- People building their watchlist who want to track what they've seen vs. want to watch
- Users who want quick "what should I watch tonight?" recommendations

### Success Metrics
- Users can classify 50+ movies in their first session
- Users return to check their top recommendations
- Low friction: works without account creation (local storage)
- Mobile-friendly for on-the-go browsing

---

## Current State

### What's Built
- **Discovery Queue**: Batch review interface (10 movies at a time)
- **Classification System**: Mark movies as Watchlist, Seen, or Not Interested
- **Ranking System**: Pairwise comparisons to build preference order
- **Data Persistence**: LocalStorage with export/import functionality
- **Movie Data**: 1000 top-rated movies (title, year, genres) from Kaggle CSV
- **UI**: Dark-themed, responsive interface

### What Works
- Basic flow: discover → classify → rank
- Data persists across sessions
- Export/import for backup

### Known Gaps
- No testing/validation done yet
- Not deployed publicly
- Limited movie metadata (no posters, ratings, streaming info)
- No search or filtering
- Ranking algorithm may need optimization

---

## Priorities

### Phase 1: Stabilize & Deploy (IMMEDIATE)
**Goal:** Get the app working reliably and publicly accessible

1. **Testing & Bug Fixes**
   - Test all user flows (discovery queue, ranking, export/import)
   - Verify data persistence works correctly
   - Test on mobile devices
   - Fix any state management or UI bugs
   - Ensure ranking algorithm produces sensible results

2. **Deployment Setup**
   - Configure for GitHub Pages deployment
   - Set up build process if needed
   - Test deployed version
   - Create deployment documentation

3. **Basic UX Improvements**
   - Add loading states
   - Improve error messages
   - Add basic onboarding/help text
   - Polish mobile experience

### Phase 2: Rich Movie Data (HIGH PRIORITY)
**Goal:** Make movies visual and informative

1. **External API Integration**
   - Integrate TMDB API (recommended) or OMDb
   - Fetch movie posters
   - Get ratings (IMDB, RT, Metacritic)
   - Retrieve plot summaries
   - Display cast and crew info
   - Add streaming availability (JustWatch API or TMDB)

2. **UI Enhancements**
   - Display posters in discovery queue
   - Show movie cards with rich metadata
   - Add visual indicators for ratings
   - Include streaming service badges

### Phase 3: Discovery Features (MEDIUM PRIORITY)
**Goal:** Help users find relevant movies faster

1. **Search Functionality**
   - Search by title
   - Filter search results
   - Quick jump to specific movie

2. **Advanced Filtering**
   - Filter by genre (multi-select)
   - Filter by year/decade
   - Filter by rating threshold
   - Filter by runtime
   - Save filter presets

3. **Discovery Queue Improvements**
   - Customize batch size
   - Smart ordering (popular first, genre variety, etc.)
   - "Similar to" recommendations based on what you liked

### Phase 4: Ranking Optimization (LOWER PRIORITY)
**Goal:** Surface top recommendations efficiently

1. **Quick Recommendations View**
   - Prominent "Top 5 to Watch" section on homepage
   - "Top 10 All-Time Favorites" view
   - Confidence indicators for rankings

2. **Improved Ranking Algorithm**
   - Reduce comparison fatigue (fewer pairs needed)
   - Consider Elo rating or Glicko-2 system
   - Smart pair selection (compare similar-ranked items)
   - Option to skip comparisons

3. **Ranking Features**
   - Manual reordering option
   - "Why is this ranked here?" explanations
   - Ranking by genre or decade subcategories

---

## Technical Specifications

### Architecture
- **Frontend:** Vanilla JavaScript (ES6+), HTML5, CSS3
- **Storage:** Browser LocalStorage (primary), export to JSON file (backup)
- **APIs:**
  - TMDB API for movie metadata (free tier: 1000 requests/day)
  - Alternative: OMDb API (free tier: 1000 requests/day)
- **Hosting:** GitHub Pages (static site hosting)

### Data Model

#### Current State Schema
```javascript
{
  classifications: {
    [movieId]: "watchlist" | "seen" | "not_interested"
  },
  rankingWatchlist: [movieId1, movieId2, ...], // ordered by preference
  rankingSeen: [movieId1, movieId2, ...]
}
```

#### Proposed Extensions (Phase 2+)
```javascript
{
  classifications: { ... },
  rankingWatchlist: [ ... ],
  rankingSeen: [ ... ],

  // New: cached movie metadata
  movieCache: {
    [movieId]: {
      poster: "url",
      rating: 8.5,
      plot: "...",
      streamingOn: ["netflix", "prime"],
      lastFetched: timestamp
    }
  },

  // New: user preferences
  preferences: {
    discoveryBatchSize: 10,
    preferredGenres: ["Drama", "Sci-Fi"],
    filterPresets: [...]
  }
}
```

### API Integration Strategy

**TMDB API (Recommended)**
- Pros: Free, comprehensive data, includes streaming availability
- Cons: Requires API key, rate limits
- Implementation:
  - Users provide their own API key (stored locally)
  - Or use shared key with client-side rate limiting
  - Cache API responses in LocalStorage

**Fallback Behavior**
- App works without API (uses CSV data only)
- API features degrade gracefully
- Show "Connect API for posters & streaming info" prompt

### Deployment

**GitHub Pages Setup**
```
Repository: pick_a_movie
Branch: gh-pages (or main with /docs folder)
URL: https://[username].github.io/pick_a_movie
```

**Build Requirements**
- No build step needed (vanilla JS)
- Optional: Add basic minification for production

---

## User Flows

### First-Time User Flow
1. Land on homepage
2. See brief explanation + "Start Discovery Queue" CTA
3. Begin reviewing movies in batches
4. Classify 20-30 movies
5. Return to main menu, see stats
6. Start ranking watchlist
7. See "Top 5 Recommendations"

### Returning User Flow
1. Land on homepage
2. See top 5 recommendations immediately
3. Options:
   - Continue discovery queue
   - Re-rank watchlist
   - Search for specific movie
   - Filter discovery by genre

### Mobile Experience
- All features accessible on mobile
- Touch-friendly buttons
- Swipe gestures for discovery queue (future enhancement)
- Responsive grid layouts

---

## Feature Specifications

### Phase 1 Features

#### 1.1 Testing Checklist
- [ ] Discovery queue loads and displays movies
- [ ] Classification buttons work (watchlist/seen/not interested/skip)
- [ ] Stats update correctly
- [ ] Ranking comparison works
- [ ] Rankings persist after refresh
- [ ] Export creates valid JSON file
- [ ] Import restores state correctly
- [ ] Mobile layout works on iOS/Android
- [ ] Back button navigation works
- [ ] Edge cases: empty lists, single item, etc.

#### 1.2 Deployment Requirements
- [ ] Files organized for static hosting
- [ ] Relative paths (no hardcoded localhost URLs)
- [ ] Configure GitHub Pages
- [ ] Add custom domain (optional)
- [ ] Test on deployed URL
- [ ] Add README with deployment instructions

#### 1.3 UX Polish
- [ ] Add loading states for state operations
- [ ] Improve empty state messages
- [ ] Add brief onboarding tooltips
- [ ] Keyboard shortcuts (space/enter to advance)
- [ ] Confirm before importing (overwrites data)

### Phase 2 Features

#### 2.1 TMDB Integration
```javascript
// API Endpoints needed:
// Search: /search/movie?query={title}&year={year}
// Details: /movie/{id}
// Providers: /movie/{id}/watch/providers
```

**Implementation Steps:**
1. Add API key configuration UI
2. Create TMDB service module
3. Match CSV movies to TMDB IDs
4. Fetch and cache metadata
5. Update UI to display rich data

#### 2.2 Movie Cards
- Poster image (with fallback)
- Title + Year
- Rating badges (IMDB, RT)
- Genre tags
- Brief plot (expandable)
- Streaming availability icons
- "More info" modal with full details

### Phase 3 Features

#### 3.1 Search
- Search input in main menu
- Real-time filtering
- Search by title
- Highlight matches
- Jump to movie in discovery queue

#### 3.2 Filters
- Multi-select genre filter
- Year range slider
- Minimum rating threshold
- Runtime filter (short/medium/long)
- "Apply filters" button
- "Clear all" option
- Filtered discovery queue

### Phase 4 Features

#### 4.1 Top Recommendations
- Dedicated section on main menu
- "Top 5 to Watch Tonight" card
- "Top 10 All-Time Favorites" card
- Quick actions (mark as watched, remove from list)

#### 4.2 Ranking Improvements
- Option: "I can't decide / similar"
- Progress indicator (X comparisons done)
- Estimated time to stable ranking
- Option to manually adjust order

---

## Open Questions & Decisions

### API Key Management
**Options:**
1. Users provide their own TMDB key (stored locally)
2. Shared key with client-side rate limiting
3. Backend proxy (requires server)

**Decision:** Option 1 (user provides key) with tutorial on getting free TMDB key

### Ranking Algorithm
**Current:** Random pairwise comparisons + bubble-up winner

**Issues:**
- May require many comparisons
- No convergence criteria
- Doesn't account for transitivity

**Alternative Approaches:**
- Elo rating system
- Quicksort-based algorithm
- Swiss tournament style

**Decision:** Test current approach first, optimize in Phase 4 if needed

### Movie Data Source
**Current:** Static CSV (1000 movies)

**Future:**
- Keep CSV as fallback
- Allow adding custom movies
- User-curated lists

**Decision:** Keep CSV, add custom movies in later phase

---

## Non-Goals (Out of Scope)

- User accounts / cloud sync
- Social features / sharing with friends
- Watching movies in-app
- Recommendation engine (ML-based)
- Ticket purchasing / streaming integration
- TV shows (movies only for now)
- Multi-language support (English only initially)

---

## Success Criteria

### Phase 1 (Launch)
- [ ] App deployed and publicly accessible
- [ ] All core features work without errors
- [ ] Mobile responsive
- [ ] Data persists correctly
- [ ] Export/import works

### Phase 2 (Rich Data)
- [ ] Movie posters displayed
- [ ] Streaming availability shown
- [ ] Ratings visible
- [ ] API integration stable

### Phase 3 (Discovery)
- [ ] Search returns accurate results
- [ ] Filters narrow discovery queue effectively
- [ ] Users can find specific movies quickly

### Phase 4 (Recommendations)
- [ ] Top 5 list prominently displayed
- [ ] Ranking requires fewer comparisons
- [ ] Users trust the recommendations

---

## Timeline Estimate

**Phase 1 (Stabilize & Deploy):** 1-2 days
- Testing: 4 hours
- Bug fixes: 4 hours
- Deployment setup: 2 hours
- Documentation: 2 hours

**Phase 2 (Rich Movie Data):** 3-4 days
- TMDB integration: 8 hours
- UI updates: 8 hours
- Testing: 4 hours

**Phase 3 (Discovery Features):** 2-3 days
- Search: 4 hours
- Filters: 6 hours
- Testing: 2 hours

**Phase 4 (Ranking Optimization):** 2-3 days
- Algorithm research: 4 hours
- Implementation: 6 hours
- Testing: 2 hours

**Total:** 8-12 days of development

---

## Resources & References

### APIs
- [TMDB API Docs](https://developers.themoviedb.org/3)
- [OMDb API](http://www.omdbapi.com/)
- [JustWatch API (unofficial)](https://github.com/dawoudt/JustWatchAPI)

### Ranking Algorithms
- [Elo Rating System](https://en.wikipedia.org/wiki/Elo_rating_system)
- [Glicko Rating System](https://en.wikipedia.org/wiki/Glicko_rating_system)

### Deployment
- [GitHub Pages Docs](https://docs.github.com/en/pages)
- [GitHub Pages Custom Domain](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)

---

## Appendix: Current File Structure

```
pick_a_movie/
├── index.html          # Main HTML structure
├── style.css           # Styling
├── script.js           # App logic
├── movies.js           # Generated movie data (1000 movies)
├── generate_movies.mjs # Script to convert CSV → movies.js
├── top_1000.csv        # Source data (Kaggle)
├── README.md           # Project overview
└── PRD.md              # This document
```

### Proposed Structure (Phase 2+)
```
pick_a_movie/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── app.js          # Main app logic
│   ├── state.js        # State management
│   ├── api.js          # TMDB API service
│   ├── ranking.js      # Ranking algorithm
│   └── ui.js           # UI helpers
├── data/
│   ├── movies.js       # Base movie data
│   └── generate_movies.mjs
├── assets/
│   └── placeholder-poster.jpg
├── docs/               # GitHub Pages directory
├── README.md
└── PRD.md
```

---

## Next Steps

1. **Review this PRD** - Make sure vision and priorities align
2. **Begin Phase 1** - Test current implementation, fix bugs
3. **Deploy to GitHub Pages** - Get it live
4. **Gather feedback** - Share with friends, identify improvements
5. **Iterate on Phase 2+** - Add features based on usage

---

**Questions or changes needed?** Let me know what adjustments to make before we start implementation!
