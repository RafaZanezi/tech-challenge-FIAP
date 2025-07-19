import { Request, Response } from 'express';

export interface Controller {
  handle(request: any): Promise<any>;
}

export function adaptRoute(controller: Controller) {
  return async (req: Request, res: Response) => {
    try {
      const httpRequest = {
        body: req.body,
        params: req.params,
        query: req.query,
        headers: req.headers,
      };

      const httpResponse = await controller.handle(httpRequest);

      res.status(httpResponse.statusCode).json(httpResponse.body);
    } catch (error) {
      console.error('Route adapter error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}
