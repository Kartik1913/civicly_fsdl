/*
   CIVICLY — JavaScript Script File
   Syllabus Concepts Demonstrated:
   - Variables (const, let)
   - Functions & Parameters
   - Arrays & Iteration (forEach)
   - Conditional Logic (if/else)
   - DOM Selection (getElementById, querySelectorAll, getElementsByClassName)
   - DOM Manipulation (style.display, innerHTML, textContent, reset)
   - Event Handling (onclick, submit)
   - Form Validation & Pattern Matching
*/

// --- 1. Category Filtering Functionality ---
function filterIssues(category, buttonElement) {
  // Get all issue cards by class name
  const issueCards = document.getElementsByClassName("issue-card-wrapper");

  // Loop through all issue card elements
  for (let i = 0; i < issueCards.length; i++) {
    const card = issueCards[i];
    const cardCategory = card.getAttribute("data-category");

    // Condition: Check if 'All' is selected or category matches data attribute
    if (category === "All" || cardCategory === category) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  }

  // Update active state on filter buttons
  const filterButtons = document.querySelectorAll(".btn-filter");
  filterButtons.forEach(function (btn) {
    btn.classList.remove("active");
  });

  // Add active class to clicked button
  if (buttonElement) {
    buttonElement.classList.add("active");
  }
}

// --- 2. Report Form Validation & Ticket Generation ---
function validateReportForm(event) {
  // Prevent form submission page refresh
  event.preventDefault();

  // Retrieve Form Values via DOM Selection
  const fullName = document.getElementById("reporterName").value.trim();
  const issueTitle = document.getElementById("issueTitle").value.trim();
  const category = document.getElementById("issueCategory").value;
  // Retrieve Location Inputs
  const pinCode = document.getElementById("locPinCode").value.trim();
  const area = document.getElementById("locArea").value.trim();
  const landmark = document.getElementById("locLandmark").value.trim();

  const description = document.getElementById("issueDescription").value.trim();
  const alertBox = document.getElementById("formAlertBox");
  const ticketDisplay = document.getElementById("ticketResultBox");

  // Validation Checks
  if (fullName === "") {
    showError("Please enter your full name.");
    return false;
  }

  if (issueTitle === "") {
    showError("Please enter the issue title.");
    return false;
  }

  if (category === "") {
    showError("Please select an issue category.");
    return false;
  }

  // 1. PIN Code Validation: exactly 6 numeric digits (Basic JS syllabus)
  if (pinCode.length !== 6 || isNaN(pinCode) || pinCode.indexOf(" ") !== -1) {
    showError("Please enter a valid 6-digit postal PIN code (e.g. 110001).");
    return false;
  }

  if (area === "") {
    showError("Please enter the Area / Locality.");
    return false;
  }

  if (landmark === "") {
    showError("Please enter a nearby Landmark or exact spot.");
    return false;
  }

  // Combine into formatted location string
  const location = landmark + ", " + area + " - " + pinCode;

  if (description === "") {
    showError("Please provide a description of the issue.");
    return false;
  }

  // Hide Error Alert if open
  alertBox.style.display = "none";

  // Generate Simple Ticket ID (e.g., CIV-1042)
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const ticketId = "CIV-" + randomNum;

  // Send record to backend using fetch POST /add (exact syllabus pattern)
  fetch("/add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ticketId: ticketId,
      reporterName: fullName,
      issueTitle: issueTitle,
      issueCategory: category,
      issueLocation: location,
      pinCode: pinCode,
      locality: area,
      landmark: landmark,
      issueDescription: description
    })
  }).then(function(res) {
    return res.json();
  }).then(function(data) {
    // DOM Manipulation to Display Success Ticket
    ticketDisplay.style.display = "block";
    ticketDisplay.innerHTML = `
      <div class="ticket-card p-4 text-center">
        <h4 class="text-success fw-bold mb-2">🎉 Report Submitted to Database!</h4>
        <p class="mb-2">Thank you <strong>${fullName}</strong> for helping improve your city.</p>
        <div class="my-3">
          <span class="badge bg-primary fs-6 px-3 py-2">Ticket ID: ${ticketId}</span>
          <span class="badge bg-warning text-dark fs-6 px-3 py-2 ms-2">Status: Submitted</span>
        </div>
        <p class="small text-muted mb-0">Your report for <strong>"${issueTitle}"</strong> in <em>${location}</em> (${category}) has been stored in MongoDB.</p>
      </div>
    `;

    // Reset form inputs
    document.getElementById("civicReportForm").reset();

    // Smooth scroll down to ticket confirmation
    ticketDisplay.scrollIntoView({ behavior: 'smooth' });

    // Reload public queue cards from database
    loadPublicIssues();
  }).catch(function(err) {
    console.error("Backend error:", err);
  });

  return true;
}

// Helper Function for Displaying Form Errors
function showError(message) {
  const alertBox = document.getElementById("formAlertBox");
  alertBox.className = "alert alert-danger shadow-sm";
  alertBox.style.display = "block";
  alertBox.innerHTML = "<strong>Error:</strong> " + message;
}

// Helper: Normalize string for comparison (lowercase & trim whitespace)
function normalizeText(text) {
  if (!text) return "";
  return text.toLowerCase().trim();
}

// Basic Duplicate Detection Demonstration (comparing PIN code, normalized locality, landmark and category)
// Note: This is a basic prototype demonstration, not reliable real-world duplicate detection.
function findDuplicates(issues) {
  const duplicateIdMap = {};

  for (let i = 0; i < issues.length; i++) {
    for (let j = i + 1; j < issues.length; j++) {
      const a = issues[i];
      const b = issues[j];

      const pinA = normalizeText(a.pinCode);
      const pinB = normalizeText(b.pinCode);
      const locA = normalizeText(a.locality);
      const locB = normalizeText(b.locality);
      const markA = normalizeText(a.landmark);
      const markB = normalizeText(b.landmark);
      const catA = normalizeText(a.category);
      const catB = normalizeText(b.category);

      // Match check: if both have pin, locality, landmark, and category matching
      const hasLocationDetails = pinA && locA && markA;
      const isMatch = hasLocationDetails &&
                      (pinA === pinB) &&
                      (locA === locB) &&
                      (markA === markB) &&
                      (catA === catB);

      if (isMatch) {
        duplicateIdMap[a._id] = true;
        duplicateIdMap[b._id] = true;
      }
    }
  }

  return duplicateIdMap;
}

// --- 3. Dynamic Public Issues Loader from MongoDB (/items) ---
function loadPublicIssues() {
  const container = document.getElementById("issueCardsContainer");
  if (!container) return;

  fetch("/items")
    .then(function(res) { return res.json(); })
    .then(function(issues) {
      if (!issues || issues.length === 0) return;

      // Detect potential duplicates
      const duplicates = findDuplicates(issues);

      // Map image fallback according to category
      function getCategoryImg(cat) {
        if (cat === "Roads") return "images/pothole.jpg";
        if (cat === "Electricity") return "images/streetlight.jpg";
        if (cat === "Sanitation") return "images/garbage.jpg";
        return "images/leak.jpg";
      }

      container.innerHTML = issues.map(function(item) {
        let badgeClass = "bg-primary";
        if (item.status === "Acknowledged") badgeClass = "bg-info text-dark";
        if (item.status === "In Progress") badgeClass = "bg-warning text-dark";
        if (item.status === "Completed" || item.status === "Resolved") badgeClass = "bg-success";

        const imgSrc = getCategoryImg(item.category);

        // Display structured details: PIN code, locality, landmark & category
        const pinText = item.pinCode ? `PIN: ${item.pinCode}` : "";
        const localityText = item.locality || "";
        const landmarkText = item.landmark || "";

        // Check if flagged as possible duplicate
        const isDuplicate = duplicates[item._id];
        const duplicateBadge = isDuplicate
          ? `<div class="mb-2"><span class="badge bg-warning text-dark border border-warning-subtle fw-semibold" title="Prototype detection: Matching PIN, locality, landmark & category">⚠️ Possible duplicate — verify location</span></div>`
          : "";

        return `
          <div class="col-md-6 col-lg-3 issue-card-wrapper" data-category="${item.category}">
            <div class="card issue-card h-100 shadow-sm overflow-hidden ${isDuplicate ? 'border-warning' : ''}">
              <img src="${imgSrc}" class="card-img-top" style="height: 160px; object-fit: cover;" alt="${item.title}">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="badge bg-secondary">${item.category}</span>
                  <span class="badge ${badgeClass}">${item.status}</span>
                </div>
                ${duplicateBadge}
                <h5 class="card-title fw-bold fs-6">${item.title}</h5>
                <p class="card-text text-secondary small mb-2">${item.description}</p>
                <div class="small text-muted border-top pt-2">
                  <div>📍 <strong>Spot:</strong> ${landmarkText || item.location}</div>
                  <div>🏘️ <strong>Area:</strong> ${localityText || 'General'}</div>
                  ${pinText ? `<div>📮 <strong>Postal:</strong> ${pinText}</div>` : ''}
                </div>
              </div>
            </div>
          </div>
        `;
      }).join("");
    })
    .catch(function(err) {
      console.log("Static fallback in place if offline:", err);
    });
}

// Load from MongoDB on page load
loadPublicIssues();

