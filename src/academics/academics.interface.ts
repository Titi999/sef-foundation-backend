export enum Terms {
  first = 'first',
  second = 'second',
  third = 'third',
}

export const terms = [Terms.first, Terms.second, Terms.third] as const;

export type termsType = (typeof terms)[number];
