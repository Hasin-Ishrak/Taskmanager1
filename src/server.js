const express = require("express");
const app = express();

app.use(express.json());
const VALID_STATUSES = ["To Do", "In Progress", "Completed"];

let tasks = [
  {
    id: 1,
    title: "Go to Sust",
    description: "For Exam",
    status: "To DO",
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: "Networking Exercise",
    description: "For Exam",
    status: "In Progress",
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    title: "Theory exam",
    description: "Semester final Exam",
    status: "Completed",
    createdAt: new Date().toISOString(),
  },
];

let nextId = 4;

app.get("/", (req, res) => {
  res.json({
    message: "Task Manager api isrunning ",
    version: "1.0.0",
    availableRoutes: {
      tasks: "/api/tasks",
    },
  });
});

app.get("/api/tasks", (req, res) => {
  const { status, search, sort } = req.query;

  if (status !== undefined) {
    const isValidStatus = VALID_STATUSES.some(
      (s) => s.toLowerCase() === status.toLowerCase(),
    );
    if (!isValidStatus) {
      return res.status(400).json({
        success: false,
        message: `Invalid status filter. Allowed values are: ${VALID_STATUSES.join(", ")}.`,
      });
    }
  }
  if (sort !== undefined && !["asc", "desc"].includes(sort.toLowerCase())) {
    return res.status(400).json({
      success: false,
      message: "Invalid sort value. Use 'asc' or 'desc'.",
    });
  }

  let result = [...tasks];
  if (status) {
    result = result.filter(
      (task) => task.status.toLowerCase() === status.toLowerCase(),
    );
  }
  if (search) {
    const searchTerm = search.toLowerCase().trim();

    result = result.filter((task) => {
      const inTitle = task.title.toLowerCase().includes(searchTerm);
      const inDescription = task.description.toLowerCase().includes(searchTerm);
      return inTitle || inDescription;
    });
  }
  if (sort) {
    result.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);

      return sort.toLowerCase() === "asc" ? dateA - dateB : dateB - dateA;
    });
  }
  const appliedFilters = {
    ...(status && { status }),
    ...(search && { search }),
    ...(sort && { sort }),
  };

  res.status(200).json({
    success: true,
    totalTasks: tasks.length,
    count: result.length,
    appliedFilters: appliedFilters,
    data: result,
  });
});

app.get("/api/tasks/:id", (req, res) => {
  const taskId = parseInt(req.params.id);

  if (isNaN(taskId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid ID format. ID must be a number.",
    });
  }

  const task = tasks.find((t) => t.id === taskId);

  if (!task) {
    return res.status(404).json({
      success: false,
      message: `Task with ID ${taskId} was not found.`,
    });
  }

  res.status(200).json({
    success: true,
    data: task,
  });
});


app.post("/api/tasks", (req, res) => {
  const { title, description, status } = req.body;
  const errors = [];

  if (!title || typeof title !== "string" || title.trim() === "") {
    errors.push("Title is required and must be a non-empty string.");
  }

  if (status !== undefined && !VALID_STATUSES.includes(status)) {
    errors.push(
      `Invalid status. Allowed values are: ${VALID_STATUSES.join(", ")}.`,
    );
  }

  if (description !== undefined && typeof description !== "string") {
    errors.push("Description must be a string.");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed.",
      errors: errors,
    });
  }
  const newTask = {
    id: nextId++,
    title: title.trim(),
    description: description ? description.trim() : "",
    status: status || "To Do",
    createdAt: new Date().toISOString(),
  };

  tasks.push(newTask);

  res.status(201).json({
    success: true,
    message: "Task created successfully.",
    data: newTask,
  });
});

app.put("/api/tasks/:id", (req, res) => {
  const taskId = parseInt(req.params.id);

  if (isNaN(taskId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid ID format. ID must be a number.",
    });
  }

  const taskIndex = tasks.findIndex((t) => t.id === taskId);

  if (taskIndex === -1) {
    return res.status(404).json({
      success: false,
      message: `Task with ID ${taskId} was not found.`,
    });
  }

  const { title, description, status } = req.body;
  const errors = [];
  if (title !== undefined) {
    if (typeof title !== "string" || title.trim() === "") {
      errors.push("Title must be a non-empty string.");
    }
  }
  if (status !== undefined && !VALID_STATUSES.includes(status)) {
    errors.push(
      `Invalid status. Allowed values are: ${VALID_STATUSES.join(", ")}.`,
    );
  }
  if (description !== undefined && typeof description !== "string") {
    errors.push("Description must be a string.");
  }
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed.",
      errors: errors,
    });
  }
  if (
    title === undefined &&
    description === undefined &&
    status === undefined
  ) {
    return res.status(400).json({
      success: false,
      message: "No update fields provided.",
    });
  }
  const existingTask = tasks[taskIndex];

  const updatedTask = {
    ...existingTask,
    ...(title !== undefined && { title: title.trim() }),
    ...(description !== undefined && { description: description.trim() }),
    ...(status !== undefined && { status }),
    updatedAt: new Date().toISOString(),
  };
  tasks[taskIndex] = updatedTask;

  res.status(200).json({
    success: true,
    message: "Task updated successfully.",
    data: updatedTask,
  });
});

app.delete("/api/tasks/:id", (req, res) => {
  const taskId = parseInt(req.params.id);
  if (isNaN(taskId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid ID format. ID must be a number.",
    });
  }
  const taskIndex = tasks.findIndex((t) => t.id === taskId);
  if (taskIndex === -1) {
    return res.status(404).json({
      success: false,
      message: `Task with ID ${taskId} was not found.`,
    });
  }
  const deletedTask = tasks[taskIndex];

  tasks.splice(taskIndex, 1);

  res.status(200).json({
    success: true,
    message: `Task with ID ${taskId} deleted successfully.`,
    data: deletedTask,
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log("Press clt c to stop");
});
