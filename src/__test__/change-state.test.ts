// write a unit test case to test the change-state.ts
//
// Path: src/__test__/change-state.test.ts
import handler from "@/pages/api/change-state";
import { encrypt, decrypt } from "@/shared/crypto";
import { NextApiRequest, NextApiResponse } from "next";
import * as utils from '../shared/aws-config'
jest.mock('../shared/aws-config');
jest.mock('../shared/crypto');
describe('Change State API', () => {
    let req: NextApiRequest;
    let res: NextApiResponse;
    beforeEach(() => {
        req = {
            method: 'GET',
            url: '/change-state',
            headers: {},
        } as NextApiRequest;
        res = {} as any;
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);
    }
    );
    it('should return 403 if authorization header is missing', async () => {
        await handler(req, res);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ error: 'Authorization missing' });
    }
    );
    it('should return 403 if authorization header is invalid', async () => {
        const token = '<PASSWORD>'; // this is not base64 encoded string
        req.headers.authorization = `Bearer ${token}`;
        await handler(req, res);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized Token' });
    }
    );

    it('should return 200 if the instace is stopped', async () => {
        const event: any = {
            headers: {
                action: 'stop',
                type: 'EC2',
                instance_id: 'i-1234567890abcdef0',
                authorization: process.env.APP_KEY,
            },
            method: 'GET',
            url: '/change-state',
        };

        const mockStopInstances = utils.ec2.stopInstances as jest.MockedFunction<typeof utils.ec2.stopInstances>;
        //@ts-ignore
        mockStopInstances.mockReturnValueOnce({ promise: jest.fn().mockResolvedValueOnce({}), });
        await handler(event, res);
        console.log(res.json)
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: `Instance stopped successfully.` });
    }
    );
    it('should return 200 if the instance is started', async () => {

        const event: any = {
            headers: {
                action: 'start',
                type: 'RDS',
                instance_id: 'i-1234567890abcdef0',
                authorization: process.env.APP_KEY,
            },
            method: 'GET',
            url: '/change-state',
        };
        const mockStartInstances = utils.rds.startDBInstance as jest.MockedFunction<typeof utils.rds.startDBInstance>;
        //@ts-ignore
        mockStartInstances.mockReturnValueOnce({ promise: jest.fn().mockResolvedValueOnce({}), });
        await handler(event, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: `RDS initiated successfully.` });
    }
    );
    it('should return 500 if the internal server error occurs', async () => {

        const event: any = {
            headers: {
                action: 'start',
                type: 'RDS',
                instance_id: 'i-1234567890abcdef0',
                authorization: process.env.APP_KEY,
            },
            method: 'GET',
            url: '/change-state',
        };
        await handler(event, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: `Internal Server Error` });
    }
    );
    it('should return 400 if the instance id does not exists', async () => {

        const event: any = {
            headers: {
                action: 'start',
                type: 'RDS',
                instance_id: 'i-1234567890abcdef0',
                authorization: process.env.APP_KEY,
            },
            method: 'GET',
            url: '/change-state',
        };
        const mockStartInstances = utils.rds.startDBInstance as jest.MockedFunction<typeof utils.rds.startDBInstance>;
        //@ts-ignore
        mockStartInstances.mockReturnValueOnce({ promise: jest.fn().mockRejectedValueOnce({ statusCode: 400 }), });
        await handler(event, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: `Invalid instance Id` });
    }
    );

});


