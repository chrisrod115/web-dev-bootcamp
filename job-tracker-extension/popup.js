// popup.js
// DOM Elements
const jobForm = document.getElementById('job-form');
const jobList = document.getElementById('job-list');
const jobCounter = document.getElementById('job-counter');
const filterBtn = document.getElementById('filter-btn');
const filterDropdown = document.getElementById('filter-dropdown');

// Current Filter
let currentFilter = 'All';

// Event Listeners
jobForm.addEventListener('submit', addJob);
document.addEventListener('DOMContentLoaded', displayJobs);
filterBtn.addEventListener('click', toggleFilterDropdown);

// Close filter dropdown when clicking outside
document.addEventListener('click', function(event) {
  if (!filterBtn.contains(event.target) && !filterDropdown.contains(event.target)) {
    filterDropdown.classList.add('hidden');
  }
});

// Add Job Function
function addJob(e) {
  e.preventDefault();

  const company = document.getElementById('company').value.trim();
  const jobTitle = document.getElementById('job-title').value.trim();
  const referenceId = document.getElementById('reference-id').value.trim() || 'N/A';
  const status = document.getElementById('status').value;

  if (!company || !jobTitle || !status) {
    alert('Please fill in all required fields.');
    return;
  }

  const job = { company, jobTitle, referenceId, status };

  chrome.storage.sync.get({ jobs: [] }, function(data) {
    const jobs = data.jobs;
    jobs.push(job);
    chrome.storage.sync.set({ jobs: jobs }, function() {
      jobForm.reset();
      displayJobs();
    });
  });
}

// Display Jobs Function
function displayJobs() {
  chrome.storage.sync.get({ jobs: [] }, function(data) {
    let jobs = data.jobs;

    // Apply Filter
    if (currentFilter !== 'All') {
      jobs = jobs.filter(job => job.status === currentFilter);
    }

    // Update Job Counter
    jobCounter.textContent = `Total Jobs: ${jobs.length}`;

    jobList.innerHTML = '';

    jobs.forEach((job, index) => {
      const li = document.createElement('li');

      const statusClass = `job-status status-${job.status.toLowerCase()}`;

      li.innerHTML = `
        <div class="job-info">
          <strong>${job.company}</strong>
          <small>${job.jobTitle}</small>
        </div>
        <div class="job-actions">
          <span class="${statusClass}" data-index="${index}">${job.status}</span>
          <button class="delete-btn" data-index="${index}">&times;</button>
        </div>
      `;

      jobList.appendChild(li);
    });

    // Add Event Listeners for Status Toggle
    const statusElements = document.querySelectorAll('.job-status');
    statusElements.forEach(el => {
      el.addEventListener('click', toggleStatus);
    });

    // Add Event Listeners for Delete Buttons
    const deleteButtons = document.querySelectorAll('.delete-btn');
    deleteButtons.forEach(btn => {
      btn.addEventListener('click', deleteJob);
    });
  });
}

// Toggle Status Function
function toggleStatus(e) {
  const index = e.target.getAttribute('data-index');
  chrome.storage.sync.get({ jobs: [] }, function(data) {
    const jobs = data.jobs;
    const currentStatus = jobs[index].status;

    const statuses = ['Applied', 'Interview', 'Offer', 'Rejected'];
    let nextStatusIndex = (statuses.indexOf(currentStatus) + 1) % statuses.length;
    jobs[index].status = statuses[nextStatusIndex];

    chrome.storage.sync.set({ jobs: jobs }, function() {
      displayJobs();
    });
  });
}

// Delete Job Function
function deleteJob(e) {
  const index = e.target.getAttribute('data-index');
  chrome.storage.sync.get({ jobs: [] }, function(data) {
    const jobs = data.jobs;
    jobs.splice(index, 1);
    chrome.storage.sync.set({ jobs: jobs }, function() {
      displayJobs();
    });
  });
}

// Toggle Filter Dropdown Function
function toggleFilterDropdown(e) {
  e.stopPropagation(); // Prevent the click from propagating to the document
  filterDropdown.classList.toggle('hidden');
}

// Handle Filter Option Click
const filterOptions = document.querySelectorAll('.filter-option');
filterOptions.forEach(option => {
  option.addEventListener('click', function() {
    currentFilter = this.getAttribute('data-status');
    displayJobs();
    filterDropdown.classList.add('hidden');
  });
});
