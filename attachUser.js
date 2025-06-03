const jwt = require('jsonwebtoken');
const userModel = require('./Models/userModel');

module.exports = async function attachUser(req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        res.locals.user = null;
        return next(); 
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded.id).lean();
        if (!user) {
            res.locals.user = null;
            return next();
        }
        req.user = user;
        res.locals.user = user;   // Pure user object for EJS
    } catch (err) {
        req.user = null;
        res.locals.user = null;
    }

    next();
};
