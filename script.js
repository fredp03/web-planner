// ...existing code...

const AIRTABLE_TOKEN = "patRMouSeo85pXzYN.2db2826eee87ae13a357ee63a1321e2225fce199147017d8d52154d404a7b246";
const AIRTABLE_BASE_ID = "appwebtabledata"; // Placeholder ID

let lastSubmittedValue = "";

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
  fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Table%201`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${AIRTABLE_TOKEN}`
    },
    body: JSON.stringify({
      fields: {
        "user-text": taskText,
        "done": false,
        "deleted": false
      }
    })
  })
  .then(response => response.json())
  .then(data => console.log("Airtable response:", data))
  .catch(err => console.error("Airtable error:", err));

  const taskList = document.getElementById("taskList");
  const li = document.createElement("li");
  li.textContent = taskText;
  taskList.appendChild(li);
}

// ...existing code...
