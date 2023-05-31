const jwt = require('jsonwebtoken');

require('dotenv').config();

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Wrong token!' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.auth = {...decoded };
        next();
    } catch {
        res.status(401).json({ error: 'Invalid request!' });
    }
};