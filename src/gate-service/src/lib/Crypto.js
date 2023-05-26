import sha256 from "sha256";
import crypto from "crypto";


export default class Crypto {
    
    static passwordHash(password) {
        return sha256(password);
    }

    static createToken() {
        return crypto.randomBytes(64).toString('hex');
    }
}