// ...existing code...

const AIRTABLE_TOKEN = "patRMouSeo85pXzYN.2db2826eee87ae13a357ee63a1321e2225fce199147017d8d52154d404a7b246";
const AIRTABLE_BASE_ID = "appoQr0hZDJPu5mh6";

let lastSubmittedValue = "";

// Load existing tasks when page loads
window.addEventListener('DOMContentLoaded', loadTasks);

function createTaskElement(taskText, done, recordId) {
    const li = document.createElement("li");
    li.className = "task-item";
    if (done) li.classList.add("task-done");
    
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = done;
    
    const span = document.createElement("span");
    span.className = "task-text";
    span.textContent = taskText;
    
    li.appendChild(checkbox);
    li.appendChild(span);
    
    // Add event listeners
    li.addEventListener('dblclick', () => toggleTaskStatus(li, recordId));
    checkbox.addEventListener('change', () => toggleTaskStatus(li, recordId));
    
    return li;
}

function toggleTaskStatus(li, recordId) {
    const isDone = !li.classList.contains("task-done");
    li.classList.toggle("task-done");
    li.querySelector('input[type="checkbox"]').checked = isDone;
    
    // Update Airtable
    fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Table%201/${recordId}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${AIRTABLE_TOKEN}`
        },
        body: JSON.stringify({
            fields: {
                "done": isDone
            }
        })
    })
    .catch(err => console.error("Error updating task status:", err));
}

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
                const li = createTaskElement(
                    record.fields["user-text"],
                    record.fields.done || false,
                    record.id
                );
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
        const record = data.records[0];
        const li = createTaskElement(taskText, false, record.id);
        taskList.appendChild(li);
    })
    .catch(err => {
        console.error("Error adding task:", err);
        alert("Error adding task. Check console for details.");
    });
}

// ...existing code...
