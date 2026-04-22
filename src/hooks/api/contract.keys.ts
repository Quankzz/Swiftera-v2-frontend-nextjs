export const contractKeys = {
  all: ["contracts"] as const,
  byRentalOrder: (rentalOrderId: string) =>
    [...contractKeys.all, "rental-order", rentalOrderId] as const,
  detail: (rentalContractId: string) =>
    [...contractKeys.all, "detail", rentalContractId] as const,
};
