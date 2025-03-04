const jwt = require('jsonwebtoken');
const env = require('../config/env');

const jwtValidate = (req, res, next) => {
    const authHeader = req.header('Authorization');

    if (!authHeader) {
        return res.status(401).json({ message: 'Access Denied: No Token Provided' });
    }

    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;

    if (!token) {
        return res.status(401).json({ message: 'Access Denied: Invalid Token Format' });
    }

    try {
        const decoded = jwt.verify(token, env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        console.log(err);
        return res.status(403).json({ message: 'Access Denied: Invalid Token' });
    }
};

const signToken = (userId, userName) => {
    try {
        return jwt.sign(
            {
                userId,
                userName
            },
            env.JWT_SECRET,
            {
                expiresIn: env.JWT_EXPIRATION
            }
        );
    } catch (error) {
        console.log(error);
        throw error;
    }
};

module.exports = { jwtValidate, signToken };