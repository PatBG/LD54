import * as Phaser from 'phaser';
import { ModuleType } from './Modules';

export class PlayerManager {
    private static instance: PlayerManager;
    protected constructor() { }
    public static getInstance(): PlayerManager {
        if (!PlayerManager.instance) {
            PlayerManager.instance = new PlayerManager();
        }
        return PlayerManager.instance;
    }

    sumNumbers(n: number): number {
        return n * (n + 1) / 2;
    }

    buyPriceStructure() : number {
        return 50;
    }

    sellPriceStructure() : number {
        return 25;
    }

    buyPrice(moduleType: ModuleType, level: number): number {
        switch (moduleType) {
            case ModuleType.Cannon: return 100 + 100 * (level - 1) + 100 * Math.floor(level / 5);
            case ModuleType.Defense: return 50 + 100 * (level - 1);
            case ModuleType.Merchandise: return 100 + 50 * this.sumNumbers(level - 1);
            default: return 0;
        }
    }

    sellPrice(moduleType: ModuleType, level: number): number {
        let price = this.buyPrice(moduleType, level);
        if (moduleType != ModuleType.Merchandise) {
            price *= 0.5;
        }
        return price;
    }

    priceUpgrade(moduleType: ModuleType, level: number): number {
        let price = this.buyPrice(moduleType, level + 1) - this.buyPrice(moduleType, level);
        if (moduleType == ModuleType.Merchandise) {
            price *= 1.5;
        }
        return price;
    }

    cannonFireRate(level: number): number {
        return 1 + level;
    }

    cannonBulletVelocity(level: number): number {
        return 500 + 250 * Math.floor(level / 5);
    }

    waveBonus(level: number): number {
        return 100 + (level - 1) * 10;
    }
}