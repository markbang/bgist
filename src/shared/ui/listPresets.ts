export const appFeedListProps = {
  initialNumToRender: 8,
  maxToRenderPerBatch: 6,
  updateCellsBatchingPeriod: 32,
  windowSize: 7,
  removeClippedSubviews: true,
} as const;

export const compactListProps = {
  initialNumToRender: 6,
  maxToRenderPerBatch: 4,
  updateCellsBatchingPeriod: 32,
  windowSize: 5,
  removeClippedSubviews: true,
} as const;
