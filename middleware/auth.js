const jwt = require('jsonwebtoken');
const User = require('../models/user');

require('dotenv').config();

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Wrong token!' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        User.findOne({ _id: decoded.userId })
            .then(user => {
                if (!user) {
                    return res.status(400).json({ message: 'Utilisateur non trouvé !' });
                }
                req.auth = {...decoded };
                next();
            })
            .catch(error => res.status(500).json({ message: error }));
    } catch {
        res.status(401).json({ error: 'Invalid request!' });
    }
};