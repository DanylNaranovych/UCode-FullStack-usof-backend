import bcrypt from 'bcrypt';
const saltRounds = 10;

function hashPassword(password) {
    return bcrypt.hashSync(password, saltRounds);
}

function comparePassword(password, hash) {
    return bcrypt.compareSync(password, hash);
}


export {hashPassword, comparePassword};
