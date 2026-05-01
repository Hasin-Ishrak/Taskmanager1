const express = require("express");
const app = express();

app.use(express.json());
app.get("/", (req, res) => {
  res.json({
    message: "Task Manager api isrunning ",
    version: "1.0.0",
    availableRoutes: {
      tasks: "/api/tasks",
    },
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("server is running on http://localhost:${PORT}");
  console.log("Press clt c to stop");
});
