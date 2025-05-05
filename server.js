// Import required packages
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const pdfParse = require('pdf-parse'); // Added PDF parsing library
const fs = require('fs'); // For reading the uploaded files
const multer = require('multer'); // Add multer for file upload handling
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));
app.use('/dark-bg.gif', express.static('public/dark-bg.gif'));
app.use('/EB.png', express.static('public/EB.png'));
app.use('/abcdefg.jpeg', express.static('public/abcdefg.jpeg'));

app.use('/flowcharts', express.static('public/flowcharts'));


// Session and Passport setup
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_OAUTH_CLIENT_ID,
  clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_OAUTH_CALLBACK_URL
}, (accessToken, refreshToken, profile, done) => {
  done(null, profile);
}));

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((user, done) => {
  done(null, user);
});

// Predefined credentials (manual login)
const users = {
  ...Array.from({ length: 92 }, (_, i) => ({
    [`bl.en.u4cse220${i + 1}`]: { password: `bl.en.u4cse220${i + 1}`, role: 'student' }
  })).reduce((a, b) => ({ ...a, ...b }), {}),

  ...Array.from({ length: 86 }, (_, i) => ({
    [`bl.en.u4cse221${i + 1}`]: { password: `bl.en.u4cse221${i + 1}`, role: 'student' }
  })).reduce((a, b) => ({ ...a, ...b }), {}),

  ...Array.from({ length: 91 }, (_, i) => ({
    [`bl.en.u4cse222${i + 1}`]: { password: `bl.en.u4cse222${i + 1}`, role: 'student' }
  })).reduce((a, b) => ({ ...a, ...b }), {}),

  // Teacher credentials
  'SE@01': { password: 'SE@01', role: 'teacher', subject: 'software engineering' },
  'PPL@01': { password: 'PPL@01', role: 'teacher', subject: 'principles of programming language' },
  'CS@01': { password: 'CS@01', role: 'teacher', subject: 'computer security' },
  'DS@01': { password: 'DS@01', role: 'teacher', subject: 'distributed systems' },
  'EH@01': { password: 'EH@01', role: 'teacher', subject: 'ethical hacking' },
  'DLCV@01': { password: 'DLCV@01', role: 'teacher', subject: 'deep learning for computer vision' },
  'CC@01': { password: 'CC@01', role: 'teacher', subject: 'cloud computing' },
  'MWS@01': { password: 'MWS@01', role: 'teacher', subject: 'mobile and wireless security' },
  'IOT@01': { password: 'IOT@01', role: 'teacher', subject: 'internet of things' },
  'NNDL@01': { password: 'NNDL@01', role: 'teacher', subject: 'neural networks and deep learning' },
  'TSA@01': { password: 'TSA@01', role: 'teacher', subject: 'time series analysis' },
};

// Google Drive links
const driveLinks = {
  "software engineering": "https://drive.google.com/drive/folders/14JJKG2_fnbaibJ2C798KliTkvSM5P71E",
  "principles of programming language": "https://drive.google.com/drive/folders/1kJCELq9imz1dCB32RawvlwBe6EAuzsCS",
  "computer security": "https://drive.google.com/drive/folders/1n4GjB2WwCeuggQxuZGXfqoNry4Zg_8wn",
  "distributed systems": "https://drive.google.com/drive/folders/1n0aKr0y7eZQ5B3vHcstQT5ds9xfSrqX8",
  "ethical hacking": "https://drive.google.com/drive/folders/12cQBW6GF9V6w9PjuBAgFeTj3T6q6rSze",
  "deep learning for computer vision": "https://drive.google.com/drive/folders/1cz_ksdX7uA_3W4VpAZbcXMMDvFAsVdE-",
  "cloud computing": "https://drive.google.com/drive/folders/1WThFzpQwbnMdWGleJ2HvzBFWBIGHAXBp",
  "mobile and wireless security": "https://drive.google.com/drive/folders/1Y1XylMXVEAp-Zav2tBo708zbHH7Q8jLS",
  "internet of things": "https://drive.google.com/drive/folders/1JIArzFHhDUZQsGB-8QCJ-4jdTq18R6mG",
  "neural networks and deep learning": "https://drive.google.com/drive/folders/1SEDWFyAhmP0168NRGSJYRU1hXsJ-w8KF",
  "time series analysis": "https://drive.google.com/drive/folders/1JwqtEL8QVMTiNuxjD4lbhQQBBanjzvqU",
};


// Flowchart PDF upload and rendering
const upload = multer({ dest: 'uploads/' });

function generateFlowchartFromText(text) {
  const lines = text.split('\n').filter(line => line.trim());
  let flowchart = "graph TD\n";

  lines.forEach((line, idx) => {
    const nextIdx = idx + 1;
    if (lines[nextIdx]) {
      flowchart += `step${idx}["${line.trim()}"] --> step${nextIdx}["${lines[nextIdx].trim()}"]\n`;
    }
  });

  return flowchart;

}


const { exec } = require('child_process');
const path = require('path');

app.post('/generate-flowchart-image', upload.single('file'), async (req, res) => {
  try {
    const data = await fs.promises.readFile(req.file.path);
    const parsed = await pdfParse(data);

    const mermaidCode = generateFlowchartFromText(parsed.text); // already working
    const mmdPath = `./tmp-${Date.now()}.mmd`;
    const outputPath = `./public/flowchart-${Date.now()}.png`;

    await fs.promises.writeFile(mmdPath, mermaidCode);

    exec(`mmdc -i ${mmdPath} -o ${outputPath}`, async (err) => {
      if (err) {
        console.error("Mermaid CLI error:", err);
        return res.status(500).json({ error: 'Failed to generate image' });
      }

      fs.unlinkSync(mmdPath); // cleanup
      return res.json({ imageUrl: `/flowcharts/generated_diagram.png` });
    });
  } catch (err) {
    console.error("Image generation failed:", err);
    res.status(500).json({ error: "Internal error" });
  }
});




app.post('/flowchart', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file || file.mimetype !== 'application/pdf') {
      return res.status(400).json({ error: 'Invalid or missing PDF file' });
    }

    const data = await fs.promises.readFile(file.path);
    const parsed = await pdfParse(data);
    const flowchart = generateFlowchartFromText(parsed.text);
    res.json({ flowchart });
  } catch (err) {
    console.error('Flowchart generation error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/upload', upload.single('file'), async (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).send('No file uploaded');
  }

  // Check if file is PDF and parse it
  if (file.mimetype === 'application/pdf') {
    const data = await fs.promises.readFile(file.path);
    const parsedData = await pdfParse(data);
    const text = parsedData.text;

    // Send the parsed content (file text) back to the frontend
    res.json({ success: true, text });
  } else {
    res.status(400).send('Unsupported file type');
  }
});



// Modified login route to handle predefined and Google OAuth
// Login Route (Predefined Credentials + Google Login)
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Check if the user is trying to log in with predefined credentials
  if (users[username] && users[username].password === password) {
    // For predefined credentials (teacher or student)
    return res.json({
      success: true,
      role: users[username].role,
      subject: users[username].subject || null,
    });
  }

  // If the user is logged in via Google OAuth, check the session
  if (req.isAuthenticated()) {
    return res.json({
      success: true,
      role: req.user.role || 'student',  // Default role 'student' for Google users
      subject: req.user.subject || null,
    });
  }

  // If no match, respond with invalid credentials
  res.status(401).json({ success: false, message: 'Invalid credentials' });
});


// Notes link endpoint
app.get('/notes/:subject', (req, res) => {
  const subject = req.params.subject.toLowerCase();
  const link = driveLinks[subject];
  if (link) {
    res.json({ success: true, driveLink: link });
  } else {
    res.status(404).json({ success: false, message: 'No notes found for this subject.' });
  }
});

// Chatbot endpoint (Cohere-based)
app.post('/chat', async (req, res) => {
  const { message } = req.body;
  const cohereApiKey = process.env.COHERE_API_KEY;

  if (!cohereApiKey) {
    return res.status(500).json({ error: "Cohere API key missing." });
  }

  if (!message || message.trim() === "") {
    return res.status(400).json({ error: "Empty message sent." });
  }

  try {
    const response = await axios.post(
      "https://api.cohere.ai/v1/chat",
      {
        message,
        model: "command-r-plus",
        temperature: 0.5
      },
      {
        headers: {
          "Authorization": `Bearer ${cohereApiKey}`,
          "Content-Type": "application/json"
        }
      }
    );

    const reply = response.data.text || "No response.";
    res.json({ response: reply });

  } catch (err) {
    console.error("Cohere Chatbot Error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to get response from Cohere." });
  }
});

// =================== GOOGLE LOGIN ROUTES ===================

// Google login route
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google login callback
app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    // Save user info in session or cookies
    res.cookie('user', JSON.stringify({
      name: req.user.displayName,  // Google display name
      email: req.user.emails[0].value,  // User's email
      photo: req.user.photos ? req.user.photos[0].value : null,  // User's photo
      role: 'student',  // Default role for Google users
    }));

    res.redirect('/dashboard.html?role=student');
  }
);

// Logout user
app.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
});

// API for checking logged in user
app.get('/api/user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ user: req.user });
  } else {
    res.json({ user: null });
  }
});

// =================== END GOOGLE LOGIN ===================

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
