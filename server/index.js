const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

// Load environment variables from server/.env
const envPath = path.join(__dirname, '.env');
require('dotenv').config({ path: envPath });

// Log environment loading status
console.log('\n📋 Environment Configuration:');
console.log(`   .env file path: ${envPath}`);
console.log(`   JWT_SECRET loaded: ${process.env.JWT_SECRET ? '✅ Yes (' + process.env.JWT_SECRET.substring(0, 10) + '...)' : '❌ No'}`);
console.log(`   GROQ_API_KEY loaded: ${process.env.GROQ_API_KEY ? '✅ Yes' : '❌ No'}`);
console.log(`   MONGODB_URI loaded: ${process.env.MONGODB_URI ? '✅ Yes' : '❌ No'}`);
console.log(`   PORT: ${process.env.PORT || 5000}`);
console.log('');

// Verify critical environment variables are loaded
if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'your_super_secret_jwt_key_change_this_in_production') {
  console.error('❌ ====================================');
  console.error('   JWT_SECRET is not configured!');
  console.error(`   Expected .env file at: ${envPath}`);
  console.error('   Please ensure server/.env exists and contains JWT_SECRET');
  console.error('   The server will continue but authentication will fail.');
  console.error('=====================================\n');
}

const connectDB = require('./config/database');

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/quiz', require('./routes/quiz'));
app.use('/api/forum', require('./routes/forum'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/stress', require('./routes/stress'));
app.use('/api/games', require('./routes/games'));
app.use('/api/badges', require('./routes/badges'));
app.use('/api/recommendations', require('./routes/recommendations'));
app.use('/api/projections', require('./routes/projections'));
app.use('/api/evaluate', require('./routes/evaluate'));
//app.use('/api/chat', require('./routes/chat'));


// Direct AI chat endpoint for frontend - peer to peer discussion forum
//const fetch = require('node-fetch'); 

app.post('/api/gemini', async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({
        success: false,
        error: 'Question is required'
      });
    }

    console.log('🤖 Gemini endpoint - Received question:', question.substring(0, 100));

    // Check if Groq API key is available
    if (!process.env.GROQ_API_KEY) {
      console.warn('⚠️ GROQ_API_KEY not configured, using fallback response');
      return res.json({
        success: true,
        answer: `මට ඔබගේ ප්‍රශ්නය ලැබුණි: "${question}"\n\nමේ වන විට AI සම්බන්ධතාවය ස්ථාපිත කර ඇත. Groq API භාවිතයෙන් ගණිත ප්‍රශ්න විසදීමට සුදානම්.`
      });
    }

    // Call Groq API directly
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

    const systemPrompt = `සිසුන්ගේ ගණිත ප්‍රශ්නයට පැහැදිලි, සරල උත්තරයක් දෙන්න.

  උත්තරය සැපයීමේදී:
  1. පියවරෙන් පියවර විස්තර කරන්න
  2. සිංහල භාෂාවෙන් පැහැදිලිව ලියන්න
  3. ගණිත සංකේත හා සිංහල මිශ්‍ර කළ හැක
  4. සරල උදාහරණ භාවිතා කරන්න
  5. අවසානයේ රටාව හා නීති පැහැදිලි කරන්න`;

    const startTime = Date.now();

    try {
      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: question
            }
          ],
          temperature: 0.7,
          max_tokens: 1024,
          top_p: 0.9
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Groq API Error:', response.status, errorText);

        // Fallback response for common math questions
        let fallbackAnswer = `මට ඔබගේ ප්‍රශ්නය ලැබුණි: "${question}"\n\nඋදාහරණයක්: x-2=5 නම්, x = 7.\nපියවර: x-2=5, x=5+2, x=7`;

        // Check for simple equations
        const eqMatch = question.match(/x\s*[-+]\s*(\d+)\s*=\s*(\d+)/);
        if (eqMatch) {
          const num = parseInt(eqMatch[1]);
          const result = parseInt(eqMatch[2]);
          const operator = eqMatch[0].includes('-') ? '-' : '+';

          if (operator === '-') {
            const x = result + num;
            fallbackAnswer = `x = ${x}\n\nපියවර:\nx - ${num} = ${result}\nx = ${result} + ${num}\nx = ${x}`;
          } else {
            const x = result - num;
            fallbackAnswer = `x = ${x}\n\nපියවර:\nx + ${num} = ${result}\nx = ${result} - ${num}\nx = ${x}`;
          }
        }

        return res.json({
          success: true,
          answer: fallbackAnswer
        });
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;
      const responseTime = Date.now() - startTime;

      console.log(`✅ AI Response generated in ${responseTime}ms`);

      res.json({
        success: true,
        answer: aiResponse
      });

    } catch (apiError) {
      console.error('❌ Groq API call failed:', apiError);

      // Fallback response
      res.json({
        success: true,
        answer: `මට ඔබගේ ප්‍රශ්නය ලැබුණි: "${question}"\n\nදැනට AI සේවාවට සම්බන්ධ වීමට නොහැකි විය. කරුණාකර පසුව උත්සාහ කරන්න.`
      });
    }

  } catch (error) {
    console.error('Gemini route error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});


// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'AI-Enhanced Learning Platform API is running' });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

const PORT = process.env.PORT || 5000;

// Start Server - Connect to DB first, then start server
const startServer = async () => {
  try {
    // Connect to Database
    await connectDB();

    // Start Server
    const server = app.listen(PORT, () => {
      console.log('\n🚀 ====================================');
      console.log(`   Server started successfully!`);
      console.log(`   Port: ${PORT}`);
      console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`   API URL: http://localhost:${PORT}`);
      console.log(`   Health Check: http://localhost:${PORT}/health`);
      console.log(`   Chat API Test: http://localhost:${PORT}/api/chat/test`);
      console.log('====================================\n');

      // Log AI configuration
      if (process.env.GROQ_API_KEY) {
        console.log(`   Service: Groq API`);
        console.log(`   Default Model: llama-3.3-70b-versatile`);
        console.log(`   Status: ✅ Ready`);
      } else {
        console.log(`   Status: ❌ GROQ_API_KEY not configured`);
        console.log(`   Note: Using fallback responses only`);
      }
      console.log('');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();


