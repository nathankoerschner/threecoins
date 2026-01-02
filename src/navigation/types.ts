// Navigation types for type-safe navigation

import { Reading } from '@/types';

export type RootStackParamList = {
  Casting: undefined;
  Reading: {
    reading: Reading;
  };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
