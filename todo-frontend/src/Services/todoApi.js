import axiosInstance from "./axiosInstance";

// CREATE
export const createTodoAPI = (data) =>
  axiosInstance.post("/todos", data);

// GET (pagination)
export const getTodosAPI = (page) =>
  axiosInstance.get(`/todos?page=${page}`);

// UPDATE
export const updateTodoAPI = (id, data) =>
  axiosInstance.put(`/todos/${id}`, data);

// DELETE
export const deleteTodoAPI = (id) =>
  axiosInstance.delete(`/todos/${id}`);