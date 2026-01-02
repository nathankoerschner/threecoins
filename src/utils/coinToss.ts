// Simulates tossing a single coin
// Returns true for heads (yang), false for tails (yin)
// Fair 50/50 probability
export const tossCoin = (): boolean => {
  return Math.random() >= 0.5;
};

// Simulates tossing three coins at once
// Returns array of three boolean values [coin1, coin2, coin3]
export const tossThreeCoins = (): [boolean, boolean, boolean] => {
  return [tossCoin(), tossCoin(), tossCoin()];
};
