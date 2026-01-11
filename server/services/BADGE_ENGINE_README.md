# Badge Engine Documentation

## Overview

The Badge Engine is a comprehensive gamification system that automatically tracks user activities and awards digital badges based on predefined criteria. It integrates seamlessly with the AI-Enhanced Learning Platform to motivate students and recognize their achievements.

## Architecture

### Components

1. **Badge Model** (`server/models/Badge.js`)
   - Defines badge structure with criteria
   - Stores badge metadata (name, description, icon, category, rarity)
   - Supports flexible criteria definitions

2. **Badge Engine Service** (`server/services/badgeEngine.js`)
   - Core logic for badge evaluation and awarding
   - Tracks user activities and statistics
   - Automatically checks criteria and awards badges

3. **Badge Routes** (`server/routes/badges.js`)
   - API endpoints for badge management
   - User badge display and statistics

## Badge Criteria Types

The badge engine supports the following criteria types:

- **quiz_completion**: Based on number of quizzes completed
- **quiz_score**: Based on average or recent quiz scores
- **topic_mastery**: Based on mastery percentage in specific topics
- **model_paper_score**: Based on scores achieved on model papers
- **time_spent**: Based on total time spent on the platform (in minutes)
- **forum_participation**: Based on forum posts or comments made
- **streak**: Based on consecutive days of activity
- **total_quizzes**: Total number of quizzes completed
- **game_achievement**: Based on game statistics

## Default Badges

The system includes 16 default badges across various categories:

### Quiz Badges
- **First Steps** 🎯: Completed your first quiz
- **Quiz Enthusiast** 📚: Completed 10 quizzes
- **Quiz Master** 🏆: Completed 50 quizzes
- **Quiz Legend** 👑: Completed 100 quizzes

### Achievement Badges
- **Excellent Performer** ⭐: Average score of 80% or higher
- **Perfect Score** 💯: Achieved 100% on a quiz

### Model Paper Badges
- **Model Paper Expert** 📝: Scored 80%+ on a model paper
- **Model Paper Master** 🎓: Scored 90%+ on a model paper

### Mastery Badges
- **Topic Master** 🎯: Achieved 80% mastery in any topic

### Time Badges
- **Dedicated Learner** ⏰: Spent 10 hours (600 minutes) on platform
- **Time Champion** ⏳: Spent 50 hours (3000 minutes) on platform

### Streak Badges
- **Week Warrior** 🔥: 7-day learning streak
- **Monthly Champion** 🌟: 30-day learning streak

### Forum Badges
- **Forum Contributor** 💬: Made 5 forum posts
- **Forum Mentor** 🤝: Made 20 forum posts
- **Helpful Peer** 💡: Made 10 constructive comments

## Integration Points

The badge engine automatically checks and awards badges when:

1. **Quiz Completion** (`server/routes/quiz.js`)
   - Triggered after quiz submission
   - Checks quiz scores, completion counts, topic mastery

2. **Forum Participation** (`server/routes/forum.js`)
   - Triggered after creating posts or comments
   - Checks forum participation counts

3. **Game Completion** (`server/routes/games.js`)
   - Triggered after game session completion
   - Checks game achievements and statistics

4. **Dashboard View** (`server/routes/progress.js`)
   - Triggered when viewing dashboard
   - Checks overall progress and achievements

## API Endpoints

### GET `/api/badges`
Get all available badges

### GET `/api/badges/my-badges`
Get user's earned badges with status

### POST `/api/badges/check`
Manually trigger badge check for current user

### GET `/api/badges/stats`
Get badge statistics for user (progress, category breakdown, etc.)

### POST `/api/badges/initialize`
Initialize default badges in database (run once)

## Usage

### Initializing Badges

To initialize default badges in the database, call:

```bash
POST /api/badges/initialize
```

Or programmatically:

```javascript
const badgeEngine = require('./services/badgeEngine');
await badgeEngine.initializeDefaultBadges();
```

### Manual Badge Check

To manually check and award badges:

```javascript
const badgeEngine = require('./services/badgeEngine');
const newlyAwarded = await badgeEngine.checkAndAwardBadges(
  userId,
  'activity_type',
  { /* activity data */ }
);
```

### Creating Custom Badges

```javascript
const Badge = require('./models/Badge');

await Badge.create({
  badgeId: 'custom_badge',
  name: 'Custom Badge',
  description: 'Description of the badge',
  icon: '🎖️',
  category: 'achievement',
  rarity: 'common',
  criteria: [
    {
      type: 'total_quizzes',
      condition: 'greater_equal',
      value: 25
    }
  ]
});
```

## Badge Storage

Badges are stored in the User model:
- `performance.badges`: Array of badge IDs
- `performance.achievements`: Array of achievement records with dates

## Performance Considerations

- Badge checks are performed asynchronously to avoid blocking user requests
- Badge evaluation is optimized to check only relevant badges based on activity type
- User statistics are cached during badge evaluation to minimize database queries

## Future Enhancements

Potential improvements:
- Badge levels/tiers (Bronze, Silver, Gold)
- Badge expiration or renewal
- Badge collections/themes
- Social features (badge sharing, leaderboards)
- Custom badge creation by teachers/admins





