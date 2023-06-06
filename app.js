const express = require('express');
const bodyParser = require('body-parser')
const app = express();

const produitRoutes = require('./routes/produit');
const userRoutes = require('./routes/user');
const authRoutes = require('./routes/auth');
const auth = require('./middleware/auth');
const path = require('path');

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/api/auth', authRoutes);
app.use('/api/produits', auth, produitRoutes);
app.use('/api/users', auth, userRoutes);

module.exports = app;