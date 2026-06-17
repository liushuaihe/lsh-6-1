export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'lab-achievement-management-secret-key-2024',
  expiresIn: '7d'
};
