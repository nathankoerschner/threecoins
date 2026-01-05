// Navigation types for type-safe navigation

import { Reading } from '@/types';

export type RootStackParamList = {
  Introduction: undefined;
  Casting: {
    shouldReset?: boolean;
  } | undefined;
  Reading: {
    reading: Reading;
    question?: string;
  };
  Paywall: {
    nextFreeReadingTime?: number;
  };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
