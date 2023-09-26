import handler from "@/pages/api/add-user";
import { NextApiRequest, NextApiResponse } from "next";
jest.mock('../shared/database', () => ({
    //@ts-ignore
    DBCONNECT: jest.fn(() => ({
        rows: [
            { username: 'Rithicka', password: 'Rithicka' },
        ],
    })),
}));
describe('Add User API', () => {
    let req: NextApiRequest;
    let res: NextApiResponse;

    beforeEach(() => {
        req = {
            body: {
                username: 'testuser',
                password: 'testpassword',
                email: 'email',
                mobile: 'email',
            },
            method: 'POST',
            url: '/add-user',
            headers: {},
        } as NextApiRequest;
        res = {} as any;
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);
    });

    it('should return 403 if authorization header is missing', async () => {
        await handler(req, res);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ error: 'Authorization missing' });
    });
    it('should return 403 if authorization header is invalid', async () => {
        const authHeader = "Bearer ";
        req.headers.authorization = authHeader;
        await handler(req, res);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized Token' });
    });
    it('should return 403 if authorization token is invalid', async () => {
        const authToken = "<PASSWORD>";
        req.headers.authorization = `Bearer ${authToken}`;
        await handler(req, res);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized Token' });
    });
    it('should add user to database and return 200 if authorization is valid', async () => {
        req.headers['authorization'] = process.env.APP_KEY;

        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: 'User Added Successfully' });
    });
})

