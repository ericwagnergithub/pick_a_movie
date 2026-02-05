# Pick A Movie 🎬

**Discovery Queue + smart ranking for what to watch next.**

A web app that helps you discover, organize, and decide what movies to watch. Build your watchlist, rank your favorites, and get quick recommendations—all stored locally in your browser.

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://ericwagnergithub.github.io/pick_a_movie)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## ✨ Features

- **🔍 Discovery Queue**: Review movies in batches of 10
- **📋 Smart Classification**: Mark movies as Watchlist, Seen, or Not Interested
- **🏆 Ranking System**: Pairwise comparisons to build your preference order
- **💾 Local Storage**: All data stays in your browser (privacy-first)
- **📤 Export/Import**: Backup and restore your data anytime
- **📱 Mobile Friendly**: Works great on phones and tablets
- **🎯 1000 Top Movies**: Curated from Kaggle's top-rated films

---

## 🚀 Quick Start

### Try It Live

Visit the live app: **[https://ericwagnergithub.github.io/pick_a_movie](https://ericwagnergithub.github.io/pick_a_movie)**

### Run Locally

1. **Clone the repository**
   ```bash
   git clone https://github.com/ericwagnergithub/pick_a_movie.git
   cd pick_a_movie
   ```

2. **Open in browser**
   - Simply open `index.html` in your browser
   - Or use a local server:
     ```bash
     # Python 3
     python -m http.server 8000

     # Python 2
     python -m SimpleHTTPServer 8000

     # Node.js (if you have npx)
     npx serve
     ```

3. **Visit** `http://localhost:8000`

---

## 📖 How It Works

### 1. **Discover Movies**
- Review movies in batches of 10
- Classify each as:
  - **Watchlist** - Movies you want to watch
  - **Seen** - Movies you've already seen
  - **Not Interested** - Movies you're not interested in
  - **Skip** - Save for later

### 2. **Rank Your Lists**
- Compare pairs of movies ("Which would you rather watch?")
- App builds your ranked list automatically
- Works for both Watchlist and Seen movies

### 3. **Get Recommendations**
- Check your stats on the main menu
- See your ranked watchlist for quick decisions
- Export your data anytime to back it up

---

## 🎯 Use Cases

- **Decision Paralysis?** Narrow down your watchlist to top picks
- **Movie Night?** Quickly decide what to watch based on your rankings
- **Track What You've Seen** Keep a personal movie journal
- **Build Your Canon** Rank your all-time favorite films

---

## 📊 Technical Details

### Built With
- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Storage**: Browser LocalStorage API
- **Data**: 1000 movies from [Kaggle IMDB Top 1000](https://www.kaggle.com/datasets/harshitshankhdhar/imdb-dataset-of-top-1000-movies-and-tv-shows)
- **Hosting**: GitHub Pages

### Browser Compatibility
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### File Structure
```
pick_a_movie/
├── index.html              # Main app structure
├── style.css               # Styling
├── script.js               # App logic & state management
├── movies.js               # Movie data (1000 films)
├── generate_movies.mjs     # Data generator script
├── top_1000.csv            # Source data
├── README.md               # This file
├── PRD.md                  # Product roadmap
├── CODE_REVIEW.md          # Technical analysis
└── TESTING_CHECKLIST.md    # QA checklist
```

---

## 🚢 Deployment

### GitHub Pages (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Your message"
   git push origin main
   ```

2. **Enable GitHub Pages**
   - Go to your repo settings
   - Navigate to **Pages** (left sidebar)
   - Under **Source**, select:
     - Branch: `main`
     - Folder: `/ (root)`
   - Click **Save**

3. **Access your app**
   - URL: `https://[username].github.io/pick_a_movie`
   - Takes 1-2 minutes to deploy

### Other Hosting Options

- **Netlify**: Drag and drop the folder
- **Vercel**: Import from GitHub
- **Cloudflare Pages**: Connect your repo
- **Any static hosting**: Upload all files

---

## 🧪 Testing

### Manual Testing

See [TESTING_CHECKLIST.md](TESTING_CHECKLIST.md) for 40+ test cases covering:
- Discovery queue flow
- Classification and ranking
- Data persistence
- Export/import
- Mobile responsiveness
- Edge cases

### Quick Smoke Test

1. Open the app
2. Start Discovery Queue
3. Classify 5-10 movies
4. Go back to main menu
5. Verify stats updated correctly
6. Try ranking (if you added 2+ to watchlist)
7. Refresh page - data should persist
8. Test Export/Import

---

## 🛠️ Development

### Data Generation

The movie data is generated from `top_1000.csv`:

```bash
node generate_movies.mjs
```

This creates `movies.js` with stable slug-based IDs.

### Code Quality

- ✅ No build step required
- ✅ No dependencies
- ✅ Vanilla JS for maximum compatibility
- ✅ Clean separation of concerns
- ✅ Comprehensive error handling

### Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## 📋 Roadmap

See [PRD.md](PRD.md) for full product roadmap.

### ✅ Phase 1: Stabilize & Deploy (DONE)
- [x] Bug fixes and testing
- [x] GitHub Pages deployment
- [x] Documentation

### 🚧 Phase 2: Rich Movie Data (Next)
- [ ] TMDB API integration
- [ ] Movie posters and images
- [ ] Ratings (IMDB, Rotten Tomatoes)
- [ ] Streaming availability

### 📅 Phase 3: Discovery Features
- [ ] Search functionality
- [ ] Genre/year filtering
- [ ] Advanced discovery options

### 📅 Phase 4: Ranking Optimization
- [ ] Better ranking algorithm (Elo rating)
- [ ] Top 5 recommendations view
- [ ] Manual reordering

---

## 💡 Tips & Tricks

### Backup Your Data
Export your data regularly! It's stored in your browser, so clearing browser data or switching devices will lose it.

### Ranking Efficiently
- You don't need to rank everything—just enough to know your top picks
- The more comparisons you make, the more accurate the ranking
- Skip pairs if you genuinely can't decide

### Batch Size
Currently fixed at 10 movies per batch. Future versions will let you customize this.

### Mobile Experience
- Works great on mobile browsers
- Add to home screen for app-like experience (iOS Safari, Chrome Android)

---

## 🐛 Known Issues

- Ranking algorithm uses random pair selection (can be inefficient for large lists)
- No undo feature (coming in future update)
- Skipped movies reappear in next batch (by design, not a bug)

See [CODE_REVIEW.md](CODE_REVIEW.md) for detailed technical analysis.

---

## 📄 License

MIT License - feel free to use this project however you'd like!

---

## 🙏 Acknowledgments

- Movie data from [Kaggle IMDB Dataset](https://www.kaggle.com/datasets/harshitshankhdhar/imdb-dataset-of-top-1000-movies-and-tv-shows)
- Inspired by Steam Discovery Queue and Tinder's swipe mechanic
- Built with assistance from Claude (Anthropic)

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/ericwagnergithub/pick_a_movie/issues)
- **Questions**: Open a discussion or issue
- **Feature Requests**: See PRD.md for planned features

---

## 🎬 Enjoy discovering your next favorite movie!

**Star this repo** ⭐ if you find it useful!
