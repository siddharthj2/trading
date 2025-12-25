export const generateOptionChain = (indexPrice, symbol) => {
    const step = symbol === 'NIFTY 50' ? 50 : 100;
    const atmStrike = Math.round(indexPrice / step) * step;
    const strikes = [];

    for (let i = -5; i <= 5; i++) {
        const strikePrice = atmStrike + (i * step);

        // Mock Premiums based on distance from ATM
        // CE decreases as strike increases (OTM)
        // PE increases as strike increases (ITM)
        const distance = (strikePrice - indexPrice) / step;

        // Base ATM premium
        const basePremium = symbol === 'NIFTY 50' ? 150 : 350;

        // Simple decay logic
        let cePrice = basePremium - (distance * 20);
        let pePrice = basePremium + (distance * 20);

        // Add some randomness
        cePrice = Math.max(5, cePrice * (1 + (Math.random() * 0.1 - 0.05)));
        pePrice = Math.max(5, pePrice * (1 + (Math.random() * 0.1 - 0.05)));

        strikes.push({
            strike: strikePrice,
            CE: {
                symbol: `${symbol} ${strikePrice} CE`,
                price: parseFloat(cePrice.toFixed(2)),
                change: parseFloat(((Math.random() * 20) - 10).toFixed(2)),
                oi: Math.floor(Math.random() * 100000)
            },
            PE: {
                symbol: `${symbol} ${strikePrice} PE`,
                price: parseFloat(pePrice.toFixed(2)),
                change: parseFloat(((Math.random() * 20) - 10).toFixed(2)),
                oi: Math.floor(Math.random() * 100000)
            }
        });
    }
    return strikes;
};
