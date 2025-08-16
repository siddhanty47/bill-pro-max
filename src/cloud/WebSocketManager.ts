import { WebSocket, WebSocketServer } from 'ws';
import { MongoDBManager } from './MongoDBManager';
import { UserDataStore, CloudStorageConfig } from '../types';

export class WebSocketManager {
  private wss: WebSocketServer;
  private mongoManager: MongoDBManager;
  private clients: Map<string, WebSocket> = new Map();
  private userSubscriptions: Map<string, Set<string>> = new Map(); // userId -> Set of clientIds

  constructor(server: any, mongoConfig: CloudStorageConfig) {
    this.wss = new WebSocketServer({ server });
    this.mongoManager = new MongoDBManager(mongoConfig);
    this.setupWebSocketServer();
  }

  private setupWebSocketServer(): void {
    this.wss.on('connection', (ws: WebSocket, request: any) => {
      const clientId = this.generateClientId();
      this.clients.set(clientId, ws);

      console.log(`Client connected: ${clientId}`);

      ws.on('message', (message: string) => {
        try {
          const data = JSON.parse(message);
          this.handleMessage(clientId, data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
          this.sendError(clientId, 'Invalid message format');
        }
      });

      ws.on('close', () => {
        this.handleClientDisconnect(clientId);
      });

      ws.on('error', (error: any) => {
        console.error('WebSocket error:', error);
        this.handleClientDisconnect(clientId);
      });

      // Send welcome message
      this.sendMessage(clientId, {
        type: 'connection_established',
        clientId,
        timestamp: new Date()
      });
    });
  }

  private async handleMessage(clientId: string, message: any): Promise<void> {
    switch (message.type) {
      case 'subscribe_user':
        await this.handleUserSubscription(clientId, message.userId);
        break;
      
      case 'unsubscribe_user':
        await this.handleUserUnsubscription(clientId, message.userId);
        break;
      
      case 'get_user_data':
        await this.handleGetUserData(clientId, message.userId);
        break;
      
      default:
        this.sendError(clientId, `Unknown message type: ${message.type}`);
    }
  }

  private async handleUserSubscription(clientId: string, userId: string): Promise<void> {
    try {
      // Add client to user's subscription list
      if (!this.userSubscriptions.has(userId)) {
        this.userSubscriptions.set(userId, new Set());
      }
      this.userSubscriptions.get(userId)!.add(clientId);

      // Start watching user data in MongoDB
      await this.mongoManager.watchUserData(userId, (userData: UserDataStore) => {
        this.broadcastToUser(userId, {
          type: 'data_update',
          userId,
          data: userData,
          timestamp: new Date()
        });
      });

      // Send confirmation
      this.sendMessage(clientId, {
        type: 'subscription_confirmed',
        userId,
        timestamp: new Date()
      });

      console.log(`Client ${clientId} subscribed to user ${userId}`);
    } catch (error) {
      console.error('Error setting up user subscription:', error);
      this.sendError(clientId, 'Failed to subscribe to user data');
    }
  }

  private async handleUserUnsubscription(clientId: string, userId: string): Promise<void> {
    try {
      // Remove client from user's subscription list
      const userSubs = this.userSubscriptions.get(userId);
      if (userSubs) {
        userSubs.delete(clientId);
        
        // If no more clients are subscribed to this user, stop watching
        if (userSubs.size === 0) {
          await this.mongoManager.stopWatching(userId);
          this.userSubscriptions.delete(userId);
        }
      }

      // Send confirmation
      this.sendMessage(clientId, {
        type: 'unsubscription_confirmed',
        userId,
        timestamp: new Date()
      });

      console.log(`Client ${clientId} unsubscribed from user ${userId}`);
    } catch (error) {
      console.error('Error handling user unsubscription:', error);
      this.sendError(clientId, 'Failed to unsubscribe from user data');
    }
  }

  private async handleGetUserData(clientId: string, userId: string): Promise<void> {
    try {
      const userData = await this.mongoManager.loadUserData(userId);
      if (userData) {
        this.sendMessage(clientId, {
          type: 'user_data',
          userId,
          data: userData,
          timestamp: new Date()
        });
      } else {
        this.sendError(clientId, 'User data not found');
      }
    } catch (error) {
      console.error('Error getting user data:', error);
      this.sendError(clientId, 'Failed to get user data');
    }
  }

  private broadcastToUser(userId: string, message: any): void {
    const userSubs = this.userSubscriptions.get(userId);
    if (userSubs) {
      userSubs.forEach(clientId => {
        const client = this.clients.get(clientId);
        if (client && client.readyState === WebSocket.OPEN) {
          this.sendMessage(clientId, message);
        }
      });
    }
  }

  private sendMessage(clientId: string, message: any): void {
    const client = this.clients.get(clientId);
    if (client && client.readyState === WebSocket.OPEN) {
      try {
        client.send(JSON.stringify(message));
      } catch (error) {
        console.error('Error sending message to client:', error);
      }
    }
  }

  private sendError(clientId: string, errorMessage: string): void {
    this.sendMessage(clientId, {
      type: 'error',
      message: errorMessage,
      timestamp: new Date()
    });
  }

  private handleClientDisconnect(clientId: string): void {
    // Remove client from all user subscriptions
    for (const [userId, userSubs] of Array.from(this.userSubscriptions.entries())) {
      userSubs.delete(clientId);
      
      // If no more clients are subscribed to this user, stop watching
      if (userSubs.size === 0) {
        this.mongoManager.stopWatching(userId).catch(console.error);
        this.userSubscriptions.delete(userId);
      }
    }

    // Remove client
    this.clients.delete(clientId);
    console.log(`Client disconnected: ${clientId}`);
  }

  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Public methods for external use
  async connectToMongo(): Promise<void> {
    await this.mongoManager.connect();
  }

  async disconnectFromMongo(): Promise<void> {
    await this.mongoManager.disconnect();
  }

  // Get connection statistics
  getConnectionStats() {
    return {
      totalClients: this.clients.size,
      totalUserSubscriptions: this.userSubscriptions.size,
      mongoConnected: this.mongoManager.isConnectedToMongo(),
      activeChangeStreams: this.mongoManager.getActiveChangeStreamsCount()
    };
  }

  // Broadcast message to all connected clients
  broadcastToAll(message: any): void {
    this.clients.forEach((client, clientId) => {
      if (client.readyState === WebSocket.OPEN) {
        this.sendMessage(clientId, message);
      }
    });
  }
}
