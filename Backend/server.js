// server.js
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const multer = require('multer');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

// Setup multer for file uploads
const upload = multer({
  dest: path.join(__dirname, 'uploads'),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Ensure uploads directory exists
if (!fs.existsSync(path.join(__dirname, 'uploads'))) {
  fs.mkdirSync(path.join(__dirname, 'uploads'), { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/decoview', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log('MongoDB Error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: ['designer', 'admin'],
    default: 'designer'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_change_this';

// Middleware to verify token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Routes

// Signup Route
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create new user
    const user = new User({
      email,
      password,
      name: name || ''
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error during signup' });
  }
});

// Login Route
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get current user (protected route)
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile (protected route)
app.put('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const { name } = req.body;
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Chatbot Response Handler
app.post('/api/chatbot/message', (req, res) => {
  try {
    const { message, conversationId } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    // Simple AI-like response based on keywords
    const messageLower = message.toLowerCase();
    let reply = '';

    if (messageLower.includes('hello') || messageLower.includes('hi')) {
      reply = "Hello! Welcome to DecoView. I'm here to help you with any questions about our 3D furniture design platform. What can I help you with today?";
    } else if (messageLower.includes('3d') || messageLower.includes('visualization')) {
      reply = "Our 3D visualization feature lets you see your room designs in immersive 3D before purchasing. You can walk through your space virtually and make adjustments in real-time. Would you like to try it?";
    } else if (messageLower.includes('furniture') || messageLower.includes('catalog')) {
      reply = "We have an extensive catalog of high-quality furniture pieces including modern chairs, elegant dining sets, comfortable sofas, and much more. You can browse and drag-and-drop them into your room design effortlessly.";
    } else if (messageLower.includes('how') && messageLower.includes('work')) {
      reply = "DecoView works by letting you:\n1. Create or upload your room dimensions\n2. Browse our furniture catalog\n3. Drag and drop furniture into your space\n4. See real-time 3D preview\n5. Save and share your designs\n\nWould you like help with any of these steps?";
    } else if (messageLower.includes('price') || messageLower.includes('cost')) {
      reply = "Our pricing is flexible and accessible. We offer free basic design tools and premium features for advanced users. Contact our sales team for detailed pricing information.";
    } else if (messageLower.includes('save') || messageLower.includes('share')) {
      reply = "Yes! You can save all your favorite designs and share them with friends, family, or interior designers for feedback. Your designs are securely stored in your account.";
    } else if (messageLower.includes('mobile') || messageLower.includes('phone')) {
      reply = "DecoView is fully responsive and works beautifully on desktop, tablet, and mobile devices. You can design on-the-go anytime, anywhere!";
    } else if (messageLower.includes('support') || messageLower.includes('help')) {
      reply = "We're here to help! You can contact our support team via email at support@decoview.com or use the help center. How can we assist you further?";
    } else if (messageLower.includes('start') || messageLower.includes('begin') || messageLower.includes('design')) {
      reply = "Great! To start designing, click on 'Start Designing Now' button or visit our design studio. You'll need an account - it only takes a minute to sign up. Ready to begin?";
    } else if (messageLower.includes('thanks') || messageLower.includes('thank you')) {
      reply = "You're welcome! Feel free to ask me anything else about DecoView. I'm always here to help! 😊";
    } else {
      reply = "That's a great question! While I might not have a specific answer for that, our team would love to help. Would you like me to provide information about our 3D visualization, furniture catalog, or how to get started?";
    }

    res.json({
      reply,
      conversationId,
      timestamp: new Date(),
      status: 'success'
    });

  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({ message: 'Error processing your message' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Design image processing endpoint
const processDesignImage = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const imagePath = req.file.path;
    const { color, texture } = req.body;
    const pythonArgs = [
      path.join(__dirname, 'process_image.py'),
      imagePath,
      path.join(__dirname, 'uploads', 'results')
    ];

    if (color) pythonArgs.push(color);
    if (texture) pythonArgs.push(texture);

    // Call Python image processor
    const python = spawn('python', pythonArgs, { cwd: __dirname });

    let output = '';
    let error = '';

    python.stdout.on('data', (data) => {
      output += data.toString();
    });

    python.stderr.on('data', (data) => {
      error += data.toString();
    });

    python.on('close', (code) => {
      if (code !== 0) {
        console.error('Python error:', error);
        fs.unlink(imagePath, () => {});
        return res.status(500).json({ message: 'Error processing image', error });
      }

      try {
        const results = JSON.parse(output);

        // Clean up original upload
        fs.unlink(imagePath, () => {});

        res.json({
          message: 'Image processed successfully',
          data: results,
          timestamp: new Date()
        });
      } catch (parseError) {
        console.error('Parse error:', parseError);
        res.status(500).json({ message: 'Error parsing results' });
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    if (req.file) fs.unlink(req.file.path, () => {});
    res.status(500).json({ message: 'Server error processing image' });
  }
};

app.post('/api/design/process-image', upload.single('image'), processDesignImage);
app.post('/api/upload', upload.single('image'), processDesignImage);
app.post('/api/process', upload.single('image'), processDesignImage);

// Get design variations
app.get('/api/design/variations/:designId', authenticateToken, async (req, res) => {
  try {
    const { designId } = req.params;
    const resultsPath = path.join(__dirname, 'uploads', 'results', designId);
    
    if (!fs.existsSync(resultsPath)) {
      return res.status(404).json({ message: 'Design not found' });
    }

    const files = fs.readdirSync(resultsPath);
    const variations = files
      .filter(f => f.startsWith('variation_'))
      .map(f => ({
        filename: f,
        url: `/api/design/image/${designId}/${f}`
      }));

    res.json({
      variations,
      count: variations.length
    });
  } catch (error) {
    console.error('Get variations error:', error);
    res.status(500).json({ message: 'Error retrieving variations' });
  }
});

// Get processed image
app.get('/api/design/image/:designId/:filename', (req, res) => {
  try {
    const { designId, filename } = req.params;
    const filepath = path.join(__dirname, 'uploads', 'results', designId, filename);
    
    // Security: prevent directory traversal
    if (!filepath.startsWith(path.join(__dirname, 'uploads', 'results'))) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ message: 'Image not found' });
    }

    res.sendFile(filepath);
  } catch (error) {
    console.error('Get image error:', error);
    res.status(500).json({ message: 'Error retrieving image' });
  }
});

// Save design
app.post('/api/designs/save', authenticateToken, async (req, res) => {
  try {
    const { name, description, variationIndex, originalImageId } = req.body;

    // Here you would save to database
    const design = {
      userId: req.user.userId,
      name,
      description,
      variationIndex,
      originalImageId,
      createdAt: new Date(),
      id: require('uuid').v4()
    };

    res.json({
      message: 'Design saved successfully',
      design
    });
  } catch (error) {
    console.error('Save design error:', error);
    res.status(500).json({ message: 'Error saving design' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});