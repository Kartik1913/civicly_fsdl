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
  const location = document.getElementById("issueLocation").value.trim();
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

  if (location === "") {
    showError("Please enter the location of the issue.");
    return false;
  }

  if (description === "") {
    showError("Please provide a description of the issue.");
    return false;
  }

  // Hide Error Alert if open
  alertBox.style.display = "none";

  // Generate Simple Ticket ID (e.g., CIV-1042)
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const ticketId = "CIV-" + randomNum;

  // DOM Manipulation to Display Success Ticket
  ticketDisplay.style.display = "block";
  ticketDisplay.innerHTML = `
    <div class="ticket-card p-4 text-center">
      <h4 class="text-success fw-bold mb-2">🎉 Report Submitted Successfully!</h4>
      <p class="mb-2">Thank you <strong>${fullName}</strong> for helping improve your city.</p>
      <div class="my-3">
        <span class="badge bg-primary fs-6 px-3 py-2">Ticket ID: ${ticketId}</span>
        <span class="badge bg-warning text-dark fs-6 px-3 py-2 ms-2">Status: Submitted</span>
      </div>
      <p class="small text-muted mb-0">Your report for <strong>"${issueTitle}"</strong> in <em>${location}</em> (${category}) has been logged into the public queue.</p>
    </div>
  `;

  // Reset form inputs
  document.getElementById("civicReportForm").reset();

  // Smooth scroll down to ticket confirmation
  ticketDisplay.scrollIntoView({ behavior: 'smooth' });

  return true;
}

// Helper Function for Displaying Form Errors
function showError(message) {
  const alertBox = document.getElementById("formAlertBox");
  alertBox.className = "alert alert-danger shadow-sm";
  alertBox.style.display = "block";
  alertBox.innerHTML = "<strong>Error:</strong> " + message;
}
