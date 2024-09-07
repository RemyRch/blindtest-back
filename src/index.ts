import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { Server as HTTPServer } from 'http';
import { PartyType } from './Types/PartyType';
import { PlayerType } from './Types/PlayerType';
import puppeteer from 'puppeteer-core';
import path from 'path';

const { Server } = require('socket.io')
const http = require('http');
const fs = require('fs');
const cors = require('cors');
const ytdl = require('@distube/ytdl-core');

dotenv.config();

const app = express();
app.use(cors());
app.get('/', async (req: Request, res: Response) => {
    res.send('Server Socket connected');
})

app.use(express.static(path.join(__dirname, '..', 'public')));

const server: HTTPServer = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: [
            'http://localhost:5173',
        ],
        methods: ['GET', 'POST']
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port  ${PORT}`);
})

const events = fs.readdirSync(__dirname + '/Events').map((file: any) => file.replace('.ts', ''));

const Parties = new Map<string, PartyType>();
const Players = new Map<string, PlayerType>();

io.on('connection', (socket: any) => {
    events.forEach((eventName: string) => {
        let event = require(__dirname + `/Events/${eventName}`);
        socket.on(eventName.replace('.js', ''), (payload: any) => {
            event.exec(io, socket, payload, Parties, Players);
        })
    })
})