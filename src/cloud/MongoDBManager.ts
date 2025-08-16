import { MongoClient, Db, Collection, ChangeStream } from 'mongodb';
import { 
  UserDataStore, 
  CloudStorageConfig, 
  CloudStorageManager, 
  SyncResult,
  ChangeStreamEvent
} from '../types';

export class MongoDBManager implements CloudStorageManager {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private collection: Collection | null = null;
  private config: CloudStorageConfig;
  private changeStreams: Map<string, ChangeStream> = new Map();
  private isConnected: boolean = false;

  constructor(config: CloudStorageConfig) {
    this.config = config;
  }

  async connect(): Promise<void> {
    try {
      this.client = new MongoClient(this.config.connectionString);
      await this.client.connect();
      this.db = this.client.db(this.config.databaseName);
      this.collection = this.db.collection(this.config.collectionName);
      this.isConnected = true;
      console.log('Connected to MongoDB successfully');
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      this.isConnected = false;
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      // Stop all change streams
      for (const [userId, changeStream] of Array.from(this.changeStreams.entries())) {
        await changeStream.close();
      }
      this.changeStreams.clear();

      if (this.client) {
        await this.client.close();
        this.client = null;
        this.db = null;
        this.collection = null;
        this.isConnected = false;
        console.log('Disconnected from MongoDB');
      }
    } catch (error) {
      console.error('Error during disconnect:', error);
      throw error;
    }
  }

  async saveUserData(userId: string, data: UserDataStore): Promise<SyncResult> {
    if (!this.collection || !this.isConnected) {
      throw new Error('Not connected to MongoDB');
    }

    try {
      const result = await this.collection.replaceOne(
        { 'user.id': userId },
        { ...data, lastSync: new Date() },
        { upsert: true }
      );

      return {
        success: true,
        message: 'Data saved successfully',
        lastSync: new Date(),
        recordsUpdated: result.modifiedCount + result.upsertedCount
      };
    } catch (error) {
      console.error('Failed to save user data:', error);
      throw error;
    }
  }

  async loadUserData(userId: string): Promise<UserDataStore | null> {
    if (!this.collection || !this.isConnected) {
      throw new Error('Not connected to MongoDB');
    }

    try {
      const data = await this.collection.findOne({ 'user.id': userId });
      return data ? this.convertMongoDocument(data) : null;
    } catch (error) {
      console.error('Failed to load user data:', error);
      throw error;
    }
  }

  async deleteUserData(userId: string): Promise<boolean> {
    if (!this.collection || !this.isConnected) {
      throw new Error('Not connected to MongoDB');
    }

    try {
      // Stop watching this user's data
      await this.stopWatching(userId);

      const result = await this.collection.deleteOne({ 'user.id': userId });
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Failed to delete user data:', error);
      throw error;
    }
  }

  async updateUserData(userId: string, updates: Partial<UserDataStore>): Promise<SyncResult> {
    if (!this.collection || !this.isConnected) {
      throw new Error('Not connected to MongoDB');
    }

    try {
      const result = await this.collection.updateOne(
        { 'user.id': userId },
        { 
          $set: { 
            ...updates, 
            lastSync: new Date() 
          } 
        }
      );

      return {
        success: true,
        message: 'Data updated successfully',
        lastSync: new Date(),
        recordsUpdated: result.modifiedCount
      };
    } catch (error) {
      console.error('Failed to update user data:', error);
      throw error;
    }
  }

  async watchUserData(userId: string, callback: (data: UserDataStore) => void): Promise<void> {
    if (!this.collection || !this.isConnected) {
      throw new Error('Not connected to MongoDB');
    }

    if (!this.config.enableChangeStreams) {
      console.warn('Change streams are not enabled. Set enableChangeStreams to true in config.');
      return;
    }

    try {
      // Stop existing change stream if any
      await this.stopWatching(userId);

      // Create change stream for this user's data
      const changeStream = this.collection.watch([
        {
          $match: {
            'fullDocument.user.id': userId,
            operationType: { $in: ['insert', 'update', 'replace'] }
          }
        }
      ]);

      // Store the change stream
      this.changeStreams.set(userId, changeStream);

      // Listen for changes
      changeStream.on('change', async (change: ChangeStreamEvent) => {
        try {
          if (change.fullDocument) {
            // Convert MongoDB document to UserDataStore
            const userData = this.convertMongoDocument(change.fullDocument);
            callback(userData);
          }
        } catch (error) {
          console.error('Error processing change stream event:', error);
        }
      });

      changeStream.on('error', (error) => {
        console.error('Change stream error for user', userId, ':', error);
      });

      console.log(`Started watching user data for user: ${userId}`);
    } catch (error) {
      console.error('Failed to start watching user data:', error);
      throw error;
    }
  }

  async stopWatching(userId: string): Promise<void> {
    const changeStream = this.changeStreams.get(userId);
    if (changeStream) {
      try {
        await changeStream.close();
        this.changeStreams.delete(userId);
        console.log(`Stopped watching user data for user: ${userId}`);
      } catch (error) {
        console.error('Error stopping change stream:', error);
      }
    }
  }

  private convertMongoDocument(doc: any): UserDataStore {
    // Convert MongoDB document to UserDataStore
    // Handle date conversions and any MongoDB-specific fields
    return {
      user: {
        ...doc.user,
        createdAt: new Date(doc.user.createdAt),
        updatedAt: new Date(doc.user.updatedAt)
      },
      inventory: doc.inventory || [],
      customers: doc.customers || [],
      challans: (doc.challans || []).map((challan: any) => ({
        ...challan,
        challanDate: new Date(challan.challanDate),
        createdAt: new Date(challan.createdAt),
        updatedAt: new Date(challan.updatedAt)
      })),
      deliveries: (doc.deliveries || []).map((delivery: any) => ({
        ...delivery,
        deliveryDate: new Date(delivery.deliveryDate),
        createdAt: new Date(delivery.createdAt),
        updatedAt: new Date(delivery.updatedAt)
      })),
      payments: (doc.payments || []).map((payment: any) => ({
        ...payment,
        paymentDate: new Date(payment.paymentDate),
        createdAt: new Date(payment.createdAt),
        updatedAt: new Date(payment.updatedAt)
      })),
      billingCalculations: (doc.billingCalculations || []).map((calc: any) => ({
        ...calc,
        calculatedAt: new Date(calc.calculatedAt)
      })),
      lastSync: new Date(doc.lastSync)
    };
  }

  // Utility method to check connection status
  isConnectedToMongo(): boolean {
    return this.isConnected;
  }

  // Method to get active change streams count
  getActiveChangeStreamsCount(): number {
    return this.changeStreams.size;
  }
}
