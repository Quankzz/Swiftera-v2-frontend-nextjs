export const userAddressKeys = {
  all: ['user-addresses'] as const,
  list: () => [...userAddressKeys.all, 'list'] as const,
  detail: (id: string) => [...userAddressKeys.all, 'detail', id] as const,
};
