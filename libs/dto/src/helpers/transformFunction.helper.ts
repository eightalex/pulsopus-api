import { TransformFnParams } from 'class-transformer/types/interfaces';

export const transformArrayFunction = (
  params: TransformFnParams,
  ens: string[] = [],
): string[] => {
  const { value } = params;
  if (typeof value !== 'string') return value;
  ens = ens.map((e) => e.toLowerCase());
  const spls = value.split(',');
  if (!ens.length) return spls;
  return spls.reduce((acc, s) => {
    if (!Boolean(ens.includes(s.toLowerCase()))) return acc;
    return [...acc, s];
  }, [] as string[]);
};
