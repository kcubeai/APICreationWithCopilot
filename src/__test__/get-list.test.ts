import handler from '../pages/api/get-list';
import { NextApiRequest, NextApiResponse } from 'next';
import * as utils from '../shared/aws-config'
import { createMocks } from 'node-mocks-http';
describe('handler', () => {
    const mockRequest: any = {
        headers: {
            type: 'EC2',
            authorization: process.env.APP_KEY
        },
        method: 'GET',
        url: '/get-list',
    };

    const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
    } as unknown as NextApiResponse;

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return a list of EC2 instances', async () => {

        const val = await handler(mockRequest, mockResponse);
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        console.log(mockResponse.json)
    });

    it('should return 403 if authorization token is invalid', async () => {
        mockRequest.headers.authorization = 'Bearer invalidkey';

        await handler(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(403);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Unauthorized Token' });
    });

    it('should return 403 if authorization token is missing', async () => {
        delete mockRequest.headers.authorization;

        await handler(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(403);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Authorization missing' });
    });

    it('should return 403 if authorization token is decrypted but invalid', async () => {
        mockRequest.headers.authorization = `Bearer ${Buffer.from('invalidkey').toString('base64')}`;

        await handler(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(403);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Unauthorized Token' });
    });

});