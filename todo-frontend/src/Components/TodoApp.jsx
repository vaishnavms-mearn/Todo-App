import { useEffect, useState, useCallback } from "react";
import {
  createTodoAPI,
  getTodosAPI,
  updateTodoAPI,
  deleteTodoAPI,
} from "../Services/todoApi";

import {
  Container,
  Form,
  Button,
  Badge,
  Modal,
  FloatingLabel,
} from "react-bootstrap";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const STATUS_OPTIONS = ["Pending", "In-Progress", "Completed"];

function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [form, setForm] = useState({ title: "", description: "" });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editTodo, setEditTodo] = useState(null);

  const delay = (ms) => new Promise((res) => setTimeout(res, ms));

  const confirmAction = (message, action) => {
    toast.info(
      ({ closeToast }) => (
        <div style={{ textAlign: "center" }}>
          <p>{message}</p>
          <div className="d-flex justify-content-center gap-2">
            <Button
              size="sm"
              variant="danger"
              onClick={() => {
                action();
                closeToast();
              }}
            >
              Yes
            </Button>
            <Button size="sm" variant="light" onClick={closeToast}>
              No
            </Button>
          </div>
        </div>
      ),
      { autoClose: false }
    );
  };

  const fetchTodos = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getTodosAPI(page);
      setTodos(res.data?.data?.todos || []);
      setTotalPages(res.data?.data?.totalPages || 1);
    } catch (err) {
      toast.error(err.response?.data?.message || "Fetch failed");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const handleAdd = () => {
    if (!form.title) return toast.warning("Title is required");

    confirmAction("Add this todo?", async () => {
      try {
        setActionLoading(true);

        const res = await createTodoAPI(form);
        await delay(700);

        setForm({ title: "", description: "" });
        toast.success(res.data?.message);
        fetchTodos();
      } catch (err) {
        toast.error(err.response?.data?.message || "Add failed");
      } finally {
        setActionLoading(false);
      }
    });
  };

  const handleDelete = (id) => {
    confirmAction("Delete this todo?", async () => {
      try {
        setActionLoading(true);

        const res = await deleteTodoAPI(id);
        await delay(700);

        toast.success(res.data?.message);
        fetchTodos();
      } catch (err) {
        toast.error(err.response?.data?.message || "Delete failed");
      } finally {
        setActionLoading(false);
      }
    });
  };

  const handleUpdate = () => {
    if (!editTodo?.title) {
      return toast.warning("Title is required");
    }

    confirmAction("Update this todo?", async () => {
      try {
        setActionLoading(true);

        const res = await updateTodoAPI(editTodo._id, editTodo);
        await delay(700);

        toast.success(res.data?.message);
        setShowModal(false);
        fetchTodos();
      } catch (err) {
        toast.error(err.response?.data?.message || "Update failed");
      } finally {
        setActionLoading(false);
      }
    });
  };

  const getBadgeVariant = (status) => {
    if (status === "Pending") return "secondary";
    if (status === "In-Progress") return "warning";
    return "success";
  };

  return (
    <>
      <Container className="mt-4 d-flex justify-content-center">
        <div
          style={{
            width: "100%",
            maxWidth: "950px",
            background: "#fff",
            borderRadius: "12px",
            padding: "24px",
            boxShadow: "0 6px 25px rgba(0,0,0,0.08)",
          }}
        >
          <ToastContainer position="top-right" autoClose={3000} theme="dark" />

          <h4 className="text-center mb-3">📝 Todo App</h4>

          {/* ADD */}
          <div
            className="mb-3 d-grid gap-2"
            style={{ gridTemplateColumns: "1fr 1fr auto" }}
          >
            <FloatingLabel label="Title">
              <Form.Control
                size="sm"
                value={form.title}
                onChange={(e) =>
                  setForm({ ...form, title: e.target.value })
                }
              />
            </FloatingLabel>

            <FloatingLabel label="Description">
              <Form.Control
                size="sm"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </FloatingLabel>

            <Button size="md" onClick={handleAdd}>
              Add
            </Button>
          </div>

          {/* HEADER */}
          {!loading && todos.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "3fr 4fr 2fr 3fr",
                padding: "12px",
                background: "#f1f3f5",
                borderRadius: "8px",
                fontWeight: "600",
                marginBottom: "6px",
                textAlign: "center",
              }}
            >
              <div>Title</div>
              <div>Description</div>
              <div>Status</div>
              <div>Actions</div>
            </div>
          )}

          {/* LIST */}
          {!loading &&
            todos.map((todo) => (
              <div
                key={todo._id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "3fr 4fr 2fr 3fr",
                  padding: "12px",
                  border: "1px solid #eee",
                  borderRadius: "8px",
                  marginBottom: "6px",
                  textAlign: "center",
                  alignItems: "center",
                }}
              >
                <div>{todo.title}</div>
                <div>{todo.description || "—"}</div>
                <div>
                  <Badge bg={getBadgeVariant(todo.status)}>
                    {todo.status}
                  </Badge>
                </div>
                <div>
                  <Button
                    size="sm"
                    variant="outline-primary"
                    className="me-1"
                    onClick={() => {
                      setEditTodo(todo);
                      setShowModal(true);
                    }}
                  >
                    Edit
                  </Button>

                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDelete(todo._id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}

          {!loading && todos.length === 0 && (
            <p className="text-center small">No Todos Created</p>
          )}

          {/* PAGINATION */}
          <div className="d-flex justify-content-center mt-3 gap-1">
            <Button
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Prev
            </Button>

            {[...Array(totalPages)].map((_, i) => (
              <Button
                key={i}
                size="sm"
                variant={page === i + 1 ? "primary" : "outline-primary"}
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </Button>
            ))}

            <Button
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>

        {/* MODAL */}
        <Modal size="sm" show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Edit Todo</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <FloatingLabel label="Title" className="mb-2">
              <Form.Control
                size="sm"
                value={editTodo?.title || ""}
                onChange={(e) =>
                  setEditTodo({ ...editTodo, title: e.target.value })
                }
              />
            </FloatingLabel>

            <FloatingLabel label="Description" className="mb-2">
              <Form.Control
                size="sm"
                value={editTodo?.description || ""}
                onChange={(e) =>
                  setEditTodo({
                    ...editTodo,
                    description: e.target.value,
                  })
                }
              />
            </FloatingLabel>

            <FloatingLabel label="Status">
              <Form.Select
                size="sm"
                value={editTodo?.status || ""}
                onChange={(e) =>
                  setEditTodo({ ...editTodo, status: e.target.value })
                }
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </Form.Select>
            </FloatingLabel>
          </Modal.Body>

          <Modal.Footer>
            <Button size="sm" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleUpdate}>
              Update
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>

      {/* CENTER LOADER */}
      {actionLoading && (
        <div className="overlay-loader">
          <div className="dot-loader">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      )}
    </>
  );
}

export default TodoApp;