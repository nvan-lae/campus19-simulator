import { useState } from 'react';
import './Shop.css';
import {SHOP_ITEMS, type GamePlayer} from '@campus19/shared';

interface ShopProps {
    currentPlayer: GamePlayer | undefined;
    allPlayers: GamePlayer[];
    onPurchase: (itemId: string) => void;
    onUseItem: (itemId: string, targetPlayerId?: number) => void;
    disabled: boolean;
    currentGlobalEvent?: 'gravity_flux' | 'inflation' | 'windy' | null;
}

export const Shop = ({
    currentPlayer,
    allPlayers,
    onPurchase,
    onUseItem,
    disabled,
    currentGlobalEvent,
}: ShopProps) => {
    const [selectedItem, setSelectedItem] = useState<string | null>(null);
    const [selectingTarget, setSelectingTarget] = useState(false);

    if (!currentPlayer) return null;

    // Calculate price with inflation if active
    const getItemPrice = (baseCost: number) => {
        if (currentGlobalEvent === 'inflation') {
            return Math.ceil(baseCost * 1.5);
        }
        return baseCost;
    };

    const handleItemClick = (itemId: string) => {
        const item = SHOP_ITEMS.find((i) => i.id === itemId);
        if (!item) return;

        if (item.targetOther) {
            setSelectedItem(itemId);
            setSelectingTarget(true);
        } else {
            onUseItem(itemId);
            setSelectedItem(null);
        }
    };

    const handleTargetSelect = (targetId: number) => {
        if (selectedItem) {
            onUseItem(selectedItem, targetId);
            setSelectedItem(null);
            setSelectingTarget(false);
        }
    };

    return (
        <div className="shop-container">
            <div className="coin-display">
                <span className="coin-icon">🪙</span>
                <span className="coin-amount">{currentPlayer.coins}</span>
            </div>

            <div className="shop-section">
                <h4>Shop{currentGlobalEvent === 'inflation' ? ' 💰 +50%' : ''}</h4>
                <div className="shop-items">
                    {SHOP_ITEMS.map((item) => {
                        const price = getItemPrice(item.cost);
                        return (
                            <button
                                key={item.id}
                                className="shop-item"
                                onClick={() => onPurchase(item.id)}
                                disabled={disabled || currentPlayer.coins < price}
                                title={item.description}
                            >
                                <span className="item-name">{item.name}</span>
                                <span className="item-cost">
                                    {currentGlobalEvent === 'inflation' && (
                                        <span className="original-price" style={{ textDecoration: 'line-through', opacity: 0.6, marginRight: '4px' }}>
                                            {item.cost}
                                        </span>
                                    )}
                                    {price} 🪙
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {currentPlayer.inventory.length > 0 && (
                <div className="inventory-section">
                    <h4>Inventory</h4>
                    <div className="inventory-items">
                        {currentPlayer.inventory.map((item, index) => (
                            <button
                                key={`${item.itemId}-${index}`}
                                className={`inventory-item ${selectedItem === item.itemId ? 'selected' : ''}`}
                                onClick={() => handleItemClick(item.itemId)}
                                disabled={disabled}
                            >
                                {item.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {selectingTarget && (
                <div className="target-selection">
                    <h4>Select Target</h4>
                    <div className="target-players">
                        {allPlayers
                            .filter((p) => p.id !== currentPlayer.id)
                            .map((player) => (
                                <button
                                    key={player.id}
                                    className="target-player"
                                    onClick={() => handleTargetSelect(player.id)}
                                    style={{ borderColor: player.color }}
                                >
                                    {player.username}
                                </button>
                            ))}
                    </div>
                    <button
                        className="cancel-button"
                        onClick={() => {
                            setSelectingTarget(false);
                            setSelectedItem(null);
                        }}
                    >
                        Cancel
                    </button>
                </div>
            )}
        </div>
    );
};
