import express from 'express';
import supertest from 'supertest';

const app = express();

export const request = supertest(app);