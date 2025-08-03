export const logError = (error: unknown, context: string) => {
  console.error(`Error in ${context}:`, error);
  // In a real application, you might want to send this to a logging service
};
