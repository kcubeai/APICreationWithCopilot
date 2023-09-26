import handler from "@/pages/api/login";
import { DBCONNECT } from "@/shared/database";
import { NextApiRequest, NextApiResponse } from "next";
// jest.mock('../shared/database');
jest.mock('../shared/database', () => ({
    //@ts-ignore
    DBCONNECT: jest.fn(() => ({
        rows: [
            { username: 'Rithicka', password: 'Rithicka' },
        ],
    })),
}));
describe('Login API', () => {
    let req: NextApiRequest;
    let res: NextApiResponse;
    beforeEach(() => {
        req = {
            method: 'POST',
            url: '/login',
            body: {
                username: 'Rithicka',
                password: 'Rithicka',
            },
            headers: {},
        } as NextApiRequest;
        res = {} as any;
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);
    });
    it('should return 200 if login is successful', async () => {
        req.headers.authorization = process.env.APP_KEY
        await handler(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: 'Login Successful', token: expect.any(String) });
    });
    it('should return 500 if login is unsuccessful', async () => {
        req.body.username = "rithicka..."
        await handler(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: 'Invalid Credentials' });
    });

})