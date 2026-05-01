const express = require("express");
const app = express();

app.use(express.json());

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
    status: "In progress",
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
  req.status(200).json({
    success: true,
    count: tasks.length,
    data: tasks,
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

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("server is running on http://localhost:${PORT}");
  console.log("Press clt c to stop");
});
