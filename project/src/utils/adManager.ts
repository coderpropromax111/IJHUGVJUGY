interface AdCallbacks {
  adFinished: () => void;
  adError: (error: { code: string; message: string }) => void;
  adStarted: () => void;
}

interface CrazyGamesSDK {
  init?: () => void;
  ad: {
    requestAd: (type: 'midgame' | 'rewarded', callbacks: AdCallbacks) => void;
    hasAdblock: () => Promise<boolean>;
  };
}

declare global {
  interface Window {
    CrazyGames?: {
      SDK: CrazyGamesSDK;
    };
  }
}

export class AdManager {
  private static instance: AdManager;
  private isAdblockDetected = false;
  private hasCheckedAdblock = false;
  private _sdkReadyPromise: Promise<boolean>;
  private gameStartTime: number | null = null;
  private lastMidgameAdTime: number | null = null;
  private midgameAdTimer: NodeJS.Timeout | null = null;
  private onAdStarted?: () => void;
  private onAdFinished?: () => void;

  private constructor() {
    this._sdkReadyPromise = this.initializeSDK();
  }

  static getInstance(): AdManager {
    if (!AdManager.instance) {
      AdManager.instance = new AdManager();
    }
    return AdManager.instance;
  }

  private async initializeSDK(): Promise<boolean> {
    return new Promise((resolve) => {
      const checkSDKReady = () => {
        if (window.CrazyGames?.SDK?.ad?.requestAd) {
          console.log('CrazyGames SDK ad functionality is ready');
          resolve(true);
          return;
        }
        
        // If SDK is not available at all, resolve as false (development mode)
        if (!window.CrazyGames?.SDK) {
          console.warn('CrazyGames SDK not available - running in development mode');
          resolve(false);
          return;
        }

        // Keep checking until SDK is ready
        setTimeout(checkSDKReady, 100);
      };

      // Start checking immediately
      checkSDKReady();
    });
  }

  setAdCallbacks(onAdStarted?: () => void, onAdFinished?: () => void) {
    this.onAdStarted = onAdStarted;
    this.onAdFinished = onAdFinished;
  }

  startGameTimer() {
    this.gameStartTime = Date.now();
    this.lastMidgameAdTime = null;
    this.scheduleMidgameAd();
  }

  stopGameTimer() {
    this.gameStartTime = null;
    this.lastMidgameAdTime = null;
    if (this.midgameAdTimer) {
      clearTimeout(this.midgameAdTimer);
      this.midgameAdTimer = null;
    }
  }

  private scheduleMidgameAd() {
    if (this.midgameAdTimer) {
      clearTimeout(this.midgameAdTimer);
    }

    // Schedule ad between 5-7 minutes (300-420 seconds)
    const minTime = 5 * 60 * 1000; // 5 minutes
    const maxTime = 7 * 60 * 1000; // 7 minutes
    const randomTime = minTime + Math.random() * (maxTime - minTime);

    this.midgameAdTimer = setTimeout(() => {
      this.showMidgameAd();
    }, randomTime);

    console.log(`Next midgame ad scheduled in ${Math.round(randomTime / 1000)} seconds`);
  }

  private async showMidgameAd() {
    if (!this.gameStartTime) return;

    const now = Date.now();
    const timeSinceStart = now - this.gameStartTime;
    const timeSinceLastAd = this.lastMidgameAdTime ? now - this.lastMidgameAdTime : timeSinceStart;

    // Only show ad if at least 5 minutes have passed since game start or last ad
    if (timeSinceLastAd < 5 * 60 * 1000) {
      this.scheduleMidgameAd();
      return;
    }

    // Wait for SDK to be ready
    const sdkReady = await this._sdkReadyPromise;
    if (!sdkReady) {
      console.warn('CrazyGames SDK not available for midgame ad');
      this.scheduleMidgameAd();
      return;
    }

    const callbacks: AdCallbacks = {
      adStarted: () => {
        console.log('Midgame ad started');
        this.pauseGame();
        this.onAdStarted?.();
      },
      adFinished: () => {
        console.log('Midgame ad finished');
        this.resumeGame();
        this.onAdFinished?.();
        this.lastMidgameAdTime = Date.now();
        this.scheduleMidgameAd(); // Schedule next ad
      },
      adError: (error) => {
        console.log('Midgame ad error:', error);
        this.resumeGame();
        this.onAdFinished?.();
        this.lastMidgameAdTime = Date.now();
        this.scheduleMidgameAd(); // Schedule next ad even if this one failed
      },
    };

    try {
      if (window.CrazyGames?.SDK?.ad?.requestAd) {
        window.CrazyGames.SDK.ad.requestAd('midgame', callbacks);
      }
    } catch (error) {
      console.error('Failed to request midgame ad:', error);
      this.scheduleMidgameAd();
    }
  }

  async checkAdblock(): Promise<boolean> {
    if (this.hasCheckedAdblock) {
      return this.isAdblockDetected;
    }

    // Wait for SDK to be ready
    const sdkReady = await this._sdkReadyPromise;
    if (!sdkReady) {
      this.isAdblockDetected = false;
      this.hasCheckedAdblock = true;
      return this.isAdblockDetected;
    }

    try {
      if (window.CrazyGames?.SDK?.ad?.hasAdblock) {
        this.isAdblockDetected = await window.CrazyGames.SDK.ad.hasAdblock();
      } else {
        // Fallback: assume no adblock if SDK is not available
        this.isAdblockDetected = false;
      }
    } catch (error) {
      console.warn('Failed to detect adblock:', error);
      this.isAdblockDetected = false;
    }

    this.hasCheckedAdblock = true;
    return this.isAdblockDetected;
  }

  async requestRewardedAd(): Promise<boolean> {
    // Wait for SDK to be ready
    const sdkReady = await this._sdkReadyPromise;
    if (!sdkReady) {
      console.warn('CrazyGames SDK not available, granting reward anyway');
      return true;
    }

    return new Promise((resolve) => {
      // Double-check if CrazyGames SDK is available
      if (!window.CrazyGames?.SDK?.ad?.requestAd) {
        console.warn('CrazyGames SDK not available, granting reward anyway');
        resolve(true);
        return;
      }

      const callbacks: AdCallbacks = {
        adStarted: () => {
          console.log('Rewarded ad started');
          this.pauseGame();
          this.onAdStarted?.();
        },
        adFinished: () => {
          console.log('Rewarded ad finished');
          this.resumeGame();
          this.onAdFinished?.();
          resolve(true);
        },
        adError: (error) => {
          console.log('Rewarded ad error:', error);
          this.resumeGame();
          this.onAdFinished?.();
          
          // Still grant reward if ad fails to load
          if (error.code === 'unfilled') {
            console.log('Ad unfilled, granting reward anyway');
            resolve(true);
          } else {
            resolve(false);
          }
        },
      };

      try {
        window.CrazyGames.SDK.ad.requestAd('rewarded', callbacks);
      } catch (error) {
        console.error('Failed to request ad:', error);
        resolve(false);
      }
    });
  }

  private pauseGame(): void {
    // Pause game logic here if needed
    // For chess, we might not need to pause anything
    console.log('Game paused for ad');
  }

  private resumeGame(): void {
    // Resume game logic here if needed
    console.log('Game resumed after ad');
  }
}