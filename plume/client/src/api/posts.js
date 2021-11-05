import api from './client';

export const getFeed = (page = 1) =>
  api.get('/posts/feed', { params: { page } }).then((r) => r.data.data);

export const getExplore = (page = 1) =>
  api.get('/posts/explore', { params: { page } }).then((r) => r.data.data);

export const getUserPosts = (username, page = 1) =>
  api.get(`/posts/user/${username}`, { params: { page } }).then((r) => r.data.data);

export const createPost = (content) =>
  api.post('/posts', { content }).then((r) => r.data.data.post);

export const toggleLike = (id) =>
  api.post(`/posts/${id}/like`).then((r) => r.data.data);

export const deletePost = (id) =>
  api.delete(`/posts/${id}`).then((r) => r.data.data);
