const express = require('express');
const axios = require('axios');
const ForumPost = require('../models/ForumPost');
const badgeEngine = require('../services/badgeEngine');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/forum/posts
// @desc    Get all forum posts
// @access  Private
router.get('/posts', protect, async (req, res) => {
  try {
    const { topic, search, page = 1, limit = 10 } = req.query;
    
    const query = {};
    if (topic) query.topic = topic;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    const posts = await ForumPost.find(query)
      .populate('userId', 'name email')
      .populate('comments.userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ForumPost.countDocuments(query);

    res.json({
      success: true,
      posts,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Get forum posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching forum posts'
    });
  }
});

// @route   POST /api/forum/posts
// @desc    Create new forum post
// @access  Private
router.post('/posts', protect, async (req, res) => {
  try {
    const { title, content, latexContent, topic, tags } = req.body;

    if (!title || !content || !topic) {
      return res.status(400).json({
        success: false,
        message: 'Title, content, and topic are required'
      });
    }

    // Moderate content using ML service
    let moderationResult = { isModerated: false, score: 0, reason: '' };
    try {
      const mlResponse = await axios.post(
        `${process.env.ML_SERVICE_URL || 'http://localhost:5001'}/moderate-text`,
        {
          text: content,
          type: 'post'
        }
      );
      moderationResult = mlResponse.data;
    } catch (mlError) {
      console.error('ML Moderation Error:', mlError);
      // Continue without moderation if service unavailable
    }

    // Analyze sentiment
    let sentiment = 'neutral';
    try {
      const sentimentResponse = await axios.post(
        `${process.env.ML_SERVICE_URL || 'http://localhost:5001'}/analyze-sentiment`,
        {
          text: content
        }
      );
      sentiment = sentimentResponse.data.sentiment;
    } catch (sentimentError) {
      console.error('Sentiment Analysis Error:', sentimentError);
    }

    const post = await ForumPost.create({
      userId: req.user._id,
      title,
      content,
      latexContent,
      topic,
      tags: tags || [],
      sentiment,
      isModerated: moderationResult.isModerated,
      moderationScore: moderationResult.score,
      moderationReason: moderationResult.reason
    });

    await post.populate('userId', 'name email');

    // Check and award badges after forum post creation
    const newlyAwardedBadges = await badgeEngine.checkAndAwardBadges(
      req.user._id,
      'forum_post_created',
      {
        postId: post._id,
        topic: post.topic
      }
    );

    res.status(201).json({
      success: true,
      post,
      newlyAwardedBadges: newlyAwardedBadges.length > 0 ? newlyAwardedBadges : undefined
    });
  } catch (error) {
    console.error('Create forum post error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating forum post'
    });
  }
});

// @route   GET /api/forum/posts/:id
// @desc    Get single forum post
// @access  Private
router.get('/posts/:id', protect, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('comments.userId', 'name email');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Increment views
    post.views += 1;
    await post.save();

    res.json({
      success: true,
      post
    });
  } catch (error) {
    console.error('Get forum post error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching forum post'
    });
  }
});

// @route   POST /api/forum/posts/:id/comments
// @desc    Add comment to forum post
// @access  Private
router.post('/posts/:id/comments', protect, async (req, res) => {
  try {
    const { content, latexContent } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required'
      });
    }

    const post = await ForumPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Moderate comment
    let moderationResult = { isModerated: false, score: 0, reason: '' };
    try {
      const mlResponse = await axios.post(
        `${process.env.ML_SERVICE_URL || 'http://localhost:5001'}/moderate-text`,
        {
          text: content,
          type: 'comment'
        }
      );
      moderationResult = mlResponse.data;
    } catch (mlError) {
      console.error('ML Moderation Error:', mlError);
    }

    // Analyze sentiment
    let sentiment = 'neutral';
    try {
      const sentimentResponse = await axios.post(
        `${process.env.ML_SERVICE_URL || 'http://localhost:5001'}/analyze-sentiment`,
        {
          text: content
        }
      );
      sentiment = sentimentResponse.data.sentiment;
    } catch (sentimentError) {
      console.error('Sentiment Analysis Error:', sentimentError);
    }

    post.comments.push({
      userId: req.user._id,
      content,
      latexContent,
      sentiment,
      isModerated: moderationResult.isModerated,
      moderationScore: moderationResult.score
    });

    await post.save();
    await post.populate('comments.userId', 'name email');

    // Check and award badges after comment creation
    const newlyAwardedBadges = await badgeEngine.checkAndAwardBadges(
      req.user._id,
      'forum_comment_created',
      {
        postId: post._id,
        commentCount: post.comments.length
      }
    );

    res.json({
      success: true,
      post,
      newlyAwardedBadges: newlyAwardedBadges.length > 0 ? newlyAwardedBadges : undefined
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding comment'
    });
  }
});

// @route   POST /api/forum/posts/:id/like
// @desc    Like/unlike a forum post
// @access  Private
router.post('/posts/:id/like', protect, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const index = post.likes.indexOf(req.user._id);
    if (index > -1) {
      post.likes.splice(index, 1);
    } else {
      post.likes.push(req.user._id);
    }

    await post.save();

    res.json({
      success: true,
      liked: index === -1,
      likesCount: post.likes.length
    });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({
      success: false,
      message: 'Error liking post'
    });
  }
});

module.exports = router;


