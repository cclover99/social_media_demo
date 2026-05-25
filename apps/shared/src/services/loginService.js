const db = require('#config/db');

exports.login = async (req, res, data) => {
    req.session.user = {
        "id": data.user_id,
        "username": data.username,
        "displayname": data.display_name || data.username,
        "profile_pic": data.profile_pic
    };

    req.session.save(err => {
        if (err) console.error(err);
        return res.redirect(302, '/');
    });
};

exports.logout = async (req, res) => {
    req.session.destroy(err => {
        if (err) console.error(err);
        return res.redirect(302, '/');
    });
};

exports.isLoggedIn  = async (req, res, next) => {
  if (!req.session.user?.id) {
    return res.status(401).json({ error: "Not logged in" });
  };

  next();
};