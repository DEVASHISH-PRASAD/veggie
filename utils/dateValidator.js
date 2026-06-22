const verifyCancellationWindowValidity = () => {
  const currentServerTime = new Date();
  const dynamicLimitTimestamp = new Date();
  dynamicLimitTimestamp.setHours(21, 30, 0, 0); // Strictly enforces the 9:30 PM cutoff line
  return currentServerTime < dynamicLimitTimestamp;
};

export { verifyCancellationWindowValidity };
