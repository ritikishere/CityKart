const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        return res.redirect('/login');
    }

    try {
        const decoded = jwt.verify(token, 'secretkey');
        req.user = decoded; 
        next();
    } catch (err) {
        return res.redirect('/login');
    }
};
