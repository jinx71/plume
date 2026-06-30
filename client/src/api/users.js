import api from './client';

export const getSuggestions = () =>
  api.get('/users/suggestions').then((r) => r.data.data.users);

export const searchUsers = (q) =>
  api.get('/users/search', { params: { q } }).then((r) => r.data.data.users);

export const getProfile = (username) =>
  api.get(`/users/${username}`).then((r) => r.data.data.user);

export const updateProfile = (payload) =>
  api.put('/users/me', payload).then((r) => r.data.data.user);

export const followUser = (id) =>
  api.post(`/users/${id}/follow`).then((r) => r.data.data.user);

export const unfollowUser = (id) =>
  api.delete(`/users/${id}/follow`).then((r) => r.data.data.user);

export const getFollowers = (username) =>
  api.get(`/users/${username}/followers`).then((r) => r.data.data.users);

export const getFollowing = (username) =>
  api.get(`/users/${username}/following`).then((r) => r.data.data.users);
