import CryptoJs from 'crypto-js';
export const decrypt = (text: string) => {
    const key = process.env.CYPHERKEY ? process.env.CYPHERKEY : "";
    var decipher = CryptoJs.AES.decrypt(text, key)
    var original = decipher.toString(CryptoJs.enc.Utf8)
    console.log(original)
    return original;
}

export const encrypt = (text: string) => {
    const key = process.env.CYPHERKEY ? process.env.CYPHERKEY : "";
    var cipher = CryptoJs.AES.encrypt(text, key).toString();
    console.log(cipher)
    return cipher;
}
