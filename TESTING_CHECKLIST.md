# Testing Checklist - Pick A Movie

## How to Test
1. Open `index.html` in your web browser (Chrome, Firefox, Edge, etc.)
2. Open browser DevTools (F12) and check the Console tab for errors
3. Follow the test cases below

---

## Test Cases

### ✅ Initial Load
- [ ] Page loads without errors in console
- [ ] Header shows "Pick A Movie 🎬"
- [ ] Main menu is visible
- [ ] Stats show all zeros initially
- [ ] Three mode buttons are visible and enabled

### ✅ Discovery Queue - Basic Flow
- [ ] Click "Start / Continue Discovery Queue"
- [ ] Discovery screen appears
- [ ] Movie title is displayed
- [ ] Progress shows "Movie 1 of 10 in this batch"
- [ ] Four buttons are visible: "I've seen this", "I want to watch this", "I'm not interested", "Skip this for now"

### ✅ Discovery Queue - Classification
- [ ] Click "I've seen this" → next movie appears
- [ ] Click "I want to watch this" → next movie appears
- [ ] Click "I'm not interested" → next movie appears
- [ ] Click "Skip this for now" → next movie appears (no classification)
- [ ] Progress counter increments correctly

### ✅ Discovery Queue - Batch Completion
- [ ] After 10 movies (or fewer if you classified them), batch complete message appears
- [ ] Buttons are disabled
- [ ] Can click "← Back to main menu"

### ✅ Stats Update
- [ ] Return to main menu
- [ ] Stats reflect your classifications
  - Watchlist: (number of movies you wanted to watch)
  - Seen: (number you marked as seen)
  - Not interested: (number you dismissed)
  - Unreviewed: (990 or so remaining)

### ✅ Ranking - Watchlist
**Prerequisites:** Add at least 2 movies to watchlist via discovery queue first

- [ ] Click "Rank your Watchlist"
- [ ] Two movies appear side by side with "vs" between them
- [ ] Each has a "Prefer this" button
- [ ] Click a "Prefer this" button → new pair appears
- [ ] Current ranking list updates below
- [ ] Back button returns to main menu

### ✅ Ranking - Seen
**Prerequisites:** Mark at least 2 movies as seen first

- [ ] Click "Rank your Seen Movies"
- [ ] Two movies appear for comparison
- [ ] Ranking works same as watchlist
- [ ] List updates correctly

### ✅ Ranking - Empty State
- [ ] If you click ranking with < 2 movies in that category
- [ ] Should show message: "You need at least 2 movies in this list to start ranking"

### ✅ Data Persistence
- [ ] Classify some movies and rank them
- [ ] Refresh the page (F5)
- [ ] Stats should persist
- [ ] Rankings should persist
- [ ] Continue discovery should remember where you left off

### ✅ Export Data
- [ ] Click "Export my data"
- [ ] A JSON file downloads (`pick_a_movie_data.json`)
- [ ] Open file in text editor
- [ ] Should contain `version`, `exportedAt`, and `state` fields

### ✅ Import Data
- [ ] Click "Import data"
- [ ] File picker appears
- [ ] Select the exported JSON file
- [ ] Alert: "Data imported successfully!"
- [ ] Stats update to match imported data

### ✅ Import - Invalid Data
- [ ] Try importing a non-JSON file or invalid JSON
- [ ] Should show error message

### ✅ Mobile Responsiveness
- [ ] Resize browser window to mobile size (< 640px)
- [ ] Layout should stack vertically
- [ ] Ranking cards should stack (not side-by-side)
- [ ] All buttons should be tap-friendly

### ✅ Edge Cases
- [ ] Discovery Queue: What happens when all 1000 movies reviewed?
  - Should show: "You've reviewed all the movies..."
- [ ] Ranking: Can you rank with only 1 movie?
  - Should show empty state message
- [ ] Back button: Works from all screens?

---

## Known Issues to Watch For

### Potential Bugs
1. **Ranking Algorithm**: Random selection might show same pair multiple times
2. **State Sync**: Rankings might not update properly when reclassifying movies
3. **Mobile**: Layout might break on very small screens
4. **Performance**: Large localStorage might cause slowdown after heavy use

### Console Errors to Investigate
- Check for:
  - "Cannot read property of undefined"
  - "MOVIES is not defined"
  - "localStorage quota exceeded"
  - Any uncaught exceptions

---

## Bug Report Template

If you find a bug, note:
```
**Bug:** [Brief description]
**Steps to reproduce:**
1.
2.
3.

**Expected:** [What should happen]
**Actual:** [What actually happened]
**Console errors:** [Any errors in DevTools console]
```

---

## Manual Test Results

### Date: ___________
### Browser: ___________

**Tests Passed:** ____ / 40
**Critical Issues Found:**
-

**Minor Issues Found:**
-

**Notes:**
