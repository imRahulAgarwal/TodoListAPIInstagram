import bcrypt from "bcrypt";

export function comparePassword(password, encrypted) {
    return bcrypt.compareSync(password, encrypted);
}

export function hashPassword(password) {
    return bcrypt.hashSync(password, 10);
}
