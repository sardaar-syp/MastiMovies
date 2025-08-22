require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const Web3 = require('web3');
const { abi } = require('./contracts/MastiMovies.json');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Web3 Configuration
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.BLOCKCHAIN_NODE));
const contract = new web3.eth.Contract(abi, process.env.CONTRACT_ADDRESS);

// Models
const User = require('./models/User');
const Theater = require('./models/Theater');

// Routes
app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { mobile } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // In production, send OTP via SMS service
    console.log(`OTP for ${mobile}: ${otp}`);
    
    // Save OTP to user
    let user = await User.findOne({ mobile });
    if (!user) {
      user = new User({ mobile });
    }
    user.otp = otp;
    user.otpExpires = Date.now() + 600000; // 10 minutes
    await user.save();
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { mobile, otp } = req.body;
    const user = await User.findOne({ mobile, otp });
    
    if (!user || user.otpExpires < Date.now()) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }
    
    // Clear OTP
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    
    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/theaters/nearby', async (req, res) => {
  try {
    const { lat, lng, radius } = req.query;
    
    // Get theaters from blockchain
    const theaterIds = await contract.methods.getNearbyTheaters(lat, lng, radius).call();
    
    // Get additional details from database
    const theaters = await Theater.find({ 
      theaterId: { $in: theaterIds }
    });
    
    res.json(theaters);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/movies/:theaterId', async (req, res) => {
  try {
    const { theaterId } = req.params;
    const movieIds = await contract.methods.getTheaterMovies(theaterId).call();
    
    const movies = await Promise.all(
      movieIds.map(id => contract.methods.movies(id).call())
    );
    
    res.json(movies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/showtimes/:movieId/:theaterId', async (req, res) => {
  try {
    const { movieId, theaterId } = req.params;
    const showTimes = await contract.methods.getShowTimes(movieId, theaterId).call();
    res.json(showTimes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/seats/:showTimeId', async (req, res) => {
  try {
    const { showTimeId } = req.params;
    const seats = await contract.methods.getAvailableSeats(showTimeId).call();
    res.json(seats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/bookings', async (req, res) => {
  try {
    const { showTimeId, seatNumbers, upiId, userAddress } = req.body;
    
    // Process UPI payment (simulated)
    const paymentSuccess = await processUpiPayment(upiId, calculateTotalAmount(seatNumbers));
    if (!paymentSuccess) throw new Error('Payment failed');
    
    // Create booking on blockchain
    const accounts = await web3.eth.getAccounts();
    const result = await contract.methods.bookTickets(
      showTimeId,
      seatNumbers,
      upiId
    ).send({ from: userAddress, value: calculateTotalAmount(seatNumbers) });
    
    res.json({ success: true, transactionHash: result.transactionHash });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper functions
async function processUpiPayment(upiId, amount) {
  // In production, integrate with UPI SDK
  console.log(`Processing UPI payment of ${amount} to ${upiId}`);
  return true;
}

function calculateTotalAmount(seatNumbers) {
  // In production, get price from contract
  return seatNumbers.length * 100; // Assuming 100 wei per ticket
}

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});