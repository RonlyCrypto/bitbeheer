// Simple server API for Bitcoin data management
// This is a basic implementation for development

export class BitcoinDataServer {
  private static instance: BitcoinDataServer;
  private data: any = null;

  private constructor() {}

  public static getInstance(): BitcoinDataServer {
    if (!BitcoinDataServer.instance) {
      BitcoinDataServer.instance = new BitcoinDataServer();
    }
    return BitcoinDataServer.instance;
  }

  // Simulate server storage (in real app, this would be a database)
  public async saveData(data: any): Promise<boolean> {
    try {
      this.data = data;
      console.log('Data saved to server (simulated)');
      return true;
    } catch (error) {
      console.error('Error saving data to server:', error);
      return false;
    }
  }

  public async loadData(): Promise<any> {
    try {
      if (this.data) {
        console.log('Data loaded from server (simulated)');
        return this.data;
      }
      return null;
    } catch (error) {
      console.error('Error loading data from server:', error);
      return null;
    }
  }

  public async getStats(): Promise<any> {
    try {
      return {
        hasData: !!this.data,
        dataSize: this.data ? JSON.stringify(this.data).length : 0,
        lastUpdated: this.data?.lastUpdated || null,
        dataCount: this.data ? {
          daily: this.data.daily?.length || 0,
          hourly: this.data.hourly?.length || 0,
          minute15: this.data.minute15?.length || 0
        } : { daily: 0, hourly: 0, minute15: 0 }
      };
    } catch (error) {
      console.error('Error getting server stats:', error);
      return null;
    }
  }
}

// Export singleton instance
export const bitcoinDataServer = BitcoinDataServer.getInstance();
