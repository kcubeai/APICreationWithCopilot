
import jwt from 'jsonwebtoken'
export const createAccessToken = (user: any): string => {
    return jwt.sign({ userId: user }, (process.env.ACCESS_TOKEN_SECRET as string), {
        expiresIn: process.env.NEXT_PUBLIC_ACCESS_TOKEN_EXPIRY as string
    });
};