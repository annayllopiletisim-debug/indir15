export const getAuthToken = () => localStorage.getItem('token');

export const setAuthToken = (token) => localStorage.setItem('token', token);

export const removeAuthToken = () => localStorage.removeItem('token');

export const getAuthUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const setAuthUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

export const removeAuthUser = () => localStorage.removeItem('user');

export const isAuthenticated = () => {
  return !!getAuthToken();
};