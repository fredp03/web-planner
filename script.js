// ...existing code...

const AIRTABLE_TOKEN = "patRMouSeo85pXzYN.2db2826eee87ae13a357ee63a1321e2225fce199147017d8d52154d404a7b246";
const AIRTABLE_BASE_ID = "appoQr0hZDJPu5mh6";

let lastSubmittedValue = "";

// Load existing tasks when page loads
window.addEventListener('DOMContentLoaded', loadTasks);

function loadTasks() {
    fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Table%201`, {
        headers: {
            "Authorization": `Bearer ${AIRTABLE_TOKEN}`
        }
    })
    .then(response => {
        console.log('Load Response:', response);
        return response.json();
    })
    .then(data => {
        console.log('Loaded Data:', data);
        const taskList = document.getElementById("taskList");
        taskList.innerHTML = ''; // Clear existing items
        data.records.forEach(record => {
            if (!record.fields.deleted) {
                const li = document.createElement("li");
                li.textContent = record.fields["user-text"];
                taskList.appendChild(li);
            }
        });
    })
    .catch(err => {
        console.error("Error loading tasks:", err);
        alert("Error loading tasks. Check console for details.");
    });
}

document.getElementById("taskInput").addEventListener("blur", function(event) {
  const taskText = event.target.value.trim();
  if (taskText && taskText !== lastSubmittedValue) {
    addTask(taskText);
    lastSubmittedValue = taskText;
  }
});

document.getElementById("todoForm").addEventListener("submit", function(event) {
  event.preventDefault();
  const taskInput = document.getElementById("taskInput");
  const taskText = taskInput.value.trim();
  if (taskText && taskText !== lastSubmittedValue) {
    addTask(taskText);
    lastSubmittedValue = taskText;
  }
  taskInput.value = "";
});

function addTask(taskText) {
    console.log('Sending to Airtable:', taskText);
    return fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Table%201`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${AIRTABLE_TOKEN}`
        },
        body: JSON.stringify({
            records: [{
                fields: {
                    "user-text": taskText,
                    "done": false,
                    "deleted": false
                }
            }]
        })
    })
    .then(response => {
        console.log('Add Response:', response);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Added Data:', data);
        const taskList = document.getElementById("taskList");
        const li = document.createElement("li");
        li.textContent = taskText;
        taskList.appendChild(li);
    })
    .catch(err => {
        console.error("Error adding task:", err);
        alert("Error adding task. Check console for details.");
    });
}

// ...existing code...
