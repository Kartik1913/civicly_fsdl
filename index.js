const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const Issue = require("./models/Issue");

const app = express();

// Parse form data & JSON as specified in syllabus skeleton sheet
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static frontend files (HTML, CSS, JS, Images)
app.use(express.static(__dirname));

// Seed default sample issues if collection is empty
async function seedDefaultIssues() {
  const count = await Issue.countDocuments();
  if (count === 0) {
    await Issue.insertMany([
      {
        ticketId: "CIV-1042",
        reporterName: "Rajesh Kumar",
        title: "Large Pothole on Main Road",
        category: "Roads",
        location: "Near City Market, Sector 14, 110001",
        pinCode: "110001",
        locality: "Sector 14",
        landmark: "Near City Market",
        description: "Deep asphalt fracture on northbound lane causing vehicle impact hazard.",
        status: "In Progress"
      },
      {
        ticketId: "CIV-1038",
        reporterName: "Pooja Verma",
        title: "Broken Streetlight Cluster",
        category: "Electricity",
        location: "Opposite Metro Station, Station Road, 110001",
        pinCode: "110001",
        locality: "Station Road",
        landmark: "Opposite Metro Station",
        description: "Pedestrian walkway dark for 2 nights leaving park entrance unlit.",
        status: "Acknowledged"
      },
      {
        ticketId: "CIV-1029",
        reporterName: "Amit Sharma",
        title: "Garbage Container Overflow",
        category: "Sanitation",
        location: "Gate No 2, Central Park, 110001",
        pinCode: "110001",
        locality: "Central Park",
        landmark: "Gate No 2",
        description: "Multiple uncollected commercial boxes blocking sidewalk path.",
        status: "Submitted"
      },
      {
        ticketId: "CIV-1015",
        reporterName: "Sunita Rao",
        title: "Pressurized Water Line Leak",
        category: "Water",
        location: "Near Petrol Pump, MG Road, 110001",
        pinCode: "110001",
        locality: "MG Road",
        landmark: "Near Petrol Pump",
        description: "Clean water leaking out from curb seam into cycle lane repaired.",
        status: "Completed"
      }
    ]);
    console.log("Default issues seeded into MongoDB.");
  }
}

// Connect to DB as taught in syllabus: mongoose.connect("mongodb://127.0.0.1:27017/civiclydb")
mongoose.connect("mongodb://127.0.0.1:27017/civiclydb").then(async () => {
  console.log("Connected to MongoDB successfully (civiclydb)");
  await seedDefaultIssues();

  // Route: Home page
  app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
  });

  // Route: Staff Portal page
  app.get("/staff", (req, res) => {
    res.sendFile(path.join(__dirname, "staff.html"));
  });

  // Route: Fetch all issues (GET /items as in syllabus skeleton)
  app.get("/items", async (req, res) => {
    const issues = await Issue.find().sort({ createdAt: -1 });
    res.json(issues);
  });

  // Route: Add a new issue (POST /add as in syllabus skeleton)
  app.post("/add", async (req, res) => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newIssueData = {
      ticketId: req.body.ticketId || ("CIV-" + randomNum),
      reporterName: req.body.reporterName,
      title: req.body.issueTitle || req.body.title,
      category: req.body.issueCategory || req.body.category,
      location: req.body.issueLocation || req.body.location,
      pinCode: req.body.pinCode || "",
      locality: req.body.locality || "",
      landmark: req.body.landmark || "",
      description: req.body.issueDescription || req.body.description,
      status: "Submitted"
    };
    const saved = await Issue.create(newIssueData);
    res.json({ message: "Report Submitted Successfully", issue: saved });
  });

  // Route: Update an issue status (for Govt Staff)
  app.post("/update-status", async (req, res) => {
    const { id, status } = req.body;
    await Issue.findByIdAndUpdate(id, { status: status });
    res.json({ message: "Status updated successfully" });
  });

  // Start server inside .then() as specified in the syllabus cheat sheet
  app.listen(5000, () => {
    console.log("Server running at http://localhost:5000");
  });
}).catch(console.error);
