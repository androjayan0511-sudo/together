import { WebSocketServer } from 'ws';
import { verifyToken } from '../utils/crypto.js';
import { userRepository } from '../repositories/userRepository.js';
import { coupleRepository } from '../repositories/coupleRepository.js';

class WebSocketManager {
  constructor() {
    this.wss = null;
    // Map: userId -> Set of WebSocket connections
    this.userSockets = new Map();
    // Map: coupleId -> Set of userIds
    this.coupleRooms = new Map();
  }

  init(server) {
    this.wss = new WebSocketServer({ server, path: '/ws' });

    this.wss.on('connection', (ws, req) => {
      let authenticatedUser = null;
      let userCouple = null;

      try {
        const url = new URL(req.url, 'http://localhost');
        const token = url.searchParams.get('token');

        if (token) {
          const decoded = verifyToken(token);
          if (decoded && decoded.userId) {
            const user = userRepository.findById(decoded.userId);
            if (user) {
              authenticatedUser = user;
              userCouple = coupleRepository.findByUserId(user.id);
            }
          }
        }
      } catch (err) {
        // Handled below if unauthenticated
      }

      if (!authenticatedUser) {
        ws.send(JSON.stringify({ type: 'ERROR', message: 'Unauthorized WebSocket connection' }));
        ws.close(4001, 'Unauthorized');
        return;
      }

      ws.userId = authenticatedUser.id;
      ws.coupleId = userCouple ? userCouple.id : null;
      ws.isAlive = true;

      // Track socket
      if (!this.userSockets.has(authenticatedUser.id)) {
        this.userSockets.set(authenticatedUser.id, new Set());
      }
      this.userSockets.get(authenticatedUser.id).add(ws);

      // Track couple room
      if (ws.coupleId) {
        if (!this.coupleRooms.has(ws.coupleId)) {
          this.coupleRooms.set(ws.coupleId, new Set());
        }
        this.coupleRooms.get(ws.coupleId).add(authenticatedUser.id);
      }

      ws.send(JSON.stringify({
        type: 'CONNECTED',
        payload: { userId: authenticatedUser.id, coupleId: ws.coupleId }
      }));

      ws.on('pong', () => {
        ws.isAlive = true;
      });

      ws.on('message', (data) => {
        try {
          const parsed = JSON.parse(data.toString());
          this.handleClientMessage(ws, parsed);
        } catch (e) {
          // ignore invalid json
        }
      });

      ws.on('close', () => {
        const sockets = this.userSockets.get(authenticatedUser.id);
        if (sockets) {
          sockets.delete(ws);
          if (sockets.size === 0) {
            this.userSockets.delete(authenticatedUser.id);
          }
        }
      });
    });

    // Heartbeat ping interval
    const interval = setInterval(() => {
      this.wss.clients.forEach((ws) => {
        if (ws.isAlive === false) return ws.terminate();
        ws.isAlive = false;
        ws.ping();
      });
    }, 30000);

    this.wss.on('close', () => {
      clearInterval(interval);
    });
  }

  handleClientMessage(ws, message) {
    if (!ws.coupleId) return;

    if (message.type === 'TYPING_START' || message.type === 'TYPING_STOP') {
      this.broadcastToCouple(ws.coupleId, {
        type: message.type,
        payload: { userId: ws.userId }
      }, ws.userId);
    }
  }

  broadcastToCouple(coupleId, eventData, excludeUserId = null) {
    if (!coupleId) return;
    const couple = coupleRepository.findById(coupleId);
    if (!couple) return;

    const targets = [couple.user_one_id, couple.user_two_id].filter(id => id && id !== excludeUserId);

    for (const targetUserId of targets) {
      const sockets = this.userSockets.get(targetUserId);
      if (sockets) {
        const messageString = JSON.stringify(eventData);
        for (const ws of sockets) {
          if (ws.readyState === ws.OPEN) {
            ws.send(messageString);
          }
        }
      }
    }
  }
}

export const wsManager = new WebSocketManager();
