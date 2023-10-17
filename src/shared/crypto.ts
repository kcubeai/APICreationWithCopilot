import CryptoJs from 'crypto-js';
export const decrypt = (text: string, key: string) => {
    // const key = process.env.CYPHERKEY ? process.env.CYPHERKEY : "";
    // console.log("key..........", key)
    var decipher = CryptoJs.AES.decrypt(text, key)
    var original = decipher.toString(CryptoJs.enc.Utf8)
    return original;
}

export const encrypt = (text: string, key: string) => {
    // const key = process.env.CYPHERKEY ? process.env.CYPHERKEY : "";
    var cipher = CryptoJs.AES.encrypt(text, key).toString();
    return cipher;
}
