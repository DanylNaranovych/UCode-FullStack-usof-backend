function passLoggedIn(req, res, next) {
    let session = req.session;
    if (!session) return res.sendStatus(401);
    if (!session.user) return res.sendStatus(401);
    if (!session.user.active) return res.sendStatus(401);
    next();
}

function passAdmin(req, res, next) {
    let session = req.session;
    if (!session) return res.sendStatus(401);
    if (!session.user) return res.sendStatus(401);
    if (!session.user.active) return res.sendStatus(401);
    if (session.user.role != 'Admin') return res.sendStatus(403);
    next();
}

function isAdminLoggedIn(req) {
    return req.session?.user?.role == 'Admin';
}

export { passLoggedIn, passAdmin, isAdminLoggedIn };
