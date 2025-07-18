// Simple auth configuration - no AWS Amplify needed
export const authConfig = {
  apiUrl: import.meta.env.VITE_API_BASE_URL || '/api'
};