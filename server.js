const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Coupon = require('./models/Coupon');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); 
app.set('view engine', 'ejs'); 

// MongoDB connection
mongoose.connect('mongodb+srv://chinomsochristian03:ahYZxLh5loYrfgss@cluster0.dmkcl.mongodb.net/buzzsecure?retryWrites=true&w=majority')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB:', err));

// API Routes
app.get('/', (req, res) => {
    res.render('index');
});
app.get('/about', (req, res) => {
    res.render('about');
});
app.get('/categories', (req, res) => {
    res.render('categories');
});
app.get('/contact', (req, res) => {
    res.render('contact');
});
app.get('/privacy', (req, res) => {
    res.render('privacy');
});
app.get('/termsAndCond', (req, res) => {
    res.render('termsAndCond');
});
app.get('/affiliate', (req, res) => {
    res.render('affiliate');
});
app.get('/admin-Dashboard', (req, res) => {
    res.render('adminDashboard');
});

// Get all coupons for the admin dashboard
app.get('/api/coupons', (req, res) => {
    Coupon.find()
        .then((coupons) => res.json(coupons))
        .catch((err) => res.status(500).json({ error: 'Error fetching coupons' }));
});

// Add a new coupon
app.post('/api/coupons', (req, res) => {
    const { offer, code } = req.body;
    const newCoupon = new Coupon({
        offer,
        code,
        used: 0,
        today: 0,
        thumbsUp: 0,
        thumbsDown: 0,
    });

    newCoupon.save()
        .then(() => res.status(201).json({ message: 'Coupon added successfully' }))
        .catch((err) => res.status(500).json({ error: 'Error adding coupon' }));
});

// Edit a coupon's details
app.put('/api/coupons/:id', (req, res) => {
    const couponId = req.params.id;
    const { offer, code } = req.body;

    Coupon.findByIdAndUpdate(couponId, { offer, code }, { new: true })
        .then(updatedCoupon => res.json(updatedCoupon))
        .catch((err) => res.status(500).json({ error: 'Error updating coupon' }));
});

// Delete a coupon
app.delete('/api/coupons/:id', (req, res) => {
    const couponId = req.params.id;

    Coupon.findByIdAndDelete(couponId)
        .then(() => res.json({ message: 'Coupon deleted successfully' }))
        .catch((err) => res.status(500).json({ error: 'Error deleting coupon' }));
});

// Get coupon interactions (thumbs-up, thumbs-down, click counts)
app.get('/api/coupons/:id/interactions', (req, res) => {
    const couponId = req.params.id;

    Coupon.findById(couponId)
        .then(coupon => {
            if (!coupon) return res.status(404).json({ error: 'Coupon not found' });
            const interactions = {
                thumbsUp: coupon.thumbsUp,
                thumbsDown: coupon.thumbsDown,
                clicks: coupon.used,
            };
            res.json(interactions);
        })
        .catch((err) => res.status(500).json({ error: 'Error fetching coupon interactions' }));
});

// Increment click count for a coupon
app.post('/api/coupons/:id/click', (req, res) => {
    const couponId = req.params.id;
    Coupon.findByIdAndUpdate(couponId, { $inc: { used: 1, today: 1 } })
        .then(() => res.status(200).json({ message: 'Coupon click count updated' }))
        .catch((err) => res.status(500).json({ error: 'Error updating coupon click count' }));
});

// Increment thumbs-up
app.post('/api/coupons/:id/thumbs-up', (req, res) => {
    const couponId = req.params.id;
    Coupon.findByIdAndUpdate(couponId, { $inc: { thumbsUp: 1 } })
        .then(() => res.status(200).json({ message: 'Thumbs up recorded' }))
        .catch(err => res.status(500).json({ error: 'Error recording thumbs up' }));
});

// Increment thumbs-down
app.post('/api/coupons/:id/thumbs-down', (req, res) => {
    const couponId = req.params.id;
    Coupon.findByIdAndUpdate(couponId, { $inc: { thumbsDown: 1 } })
        .then(() => res.status(200).json({ message: 'Thumbs down recorded' }))
        .catch(err => res.status(500).json({ error: 'Error recording thumbs down' }));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
