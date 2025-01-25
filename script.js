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
    
    const wrapper = document.createElement("div");
    wrapper.className = "div-wrapper";
    
    const checkboxWrapper = document.createElement("div");
    checkboxWrapper.className = "checkbox-wrapper";
    
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = done;
    
    const checkboxIcon = document.createElement("span");
    checkboxIcon.className = "checkbox-icon";
    
    const span = document.createElement("span");
    span.className = "task-text";
    span.textContent = taskText;
    
    checkboxWrapper.appendChild(checkbox);
    checkboxWrapper.appendChild(checkboxIcon);
    
    wrapper.appendChild(checkboxWrapper);
    wrapper.appendChild(span);
    li.appendChild(wrapper);
    
    // Update checkbox event listener to be more direct
    checkbox.addEventListener('change', function() {
        const isDone = this.checked;
        li.classList.toggle("task-done", isDone);
        
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
    });

    // Keep the existing event listeners
    span.addEventListener('dblclick', (e) => {
        const input = document.createElement("input");
        input.type = "text";
        input.value = span.textContent;
        input.className = "edit-input";
        
        input.addEventListener('blur', () => updateTaskText(input, span, recordId));
        input.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                input.blur();
            }
            if (e.key === 'Escape') {
                wrapper.replaceChild(span, input);
            }
        });
        
        wrapper.replaceChild(input, span);
        input.focus();
    });
    
    return li;
}

function updateTaskText(input, span, recordId) {
    const newText = input.value.trim();
    if (newText && newText !== span.textContent) {
        fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Table%201/${recordId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${AIRTABLE_TOKEN}`
            },
            body: JSON.stringify({
                fields: {
                    "user-text": newText
                }
            })
        })
        .then(() => {
            span.textContent = newText;
        })
        .catch(err => console.error("Error updating task text:", err));
    }
    span.parentNode.replaceChild(span, input);
}

function loadTasks() {
    fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Table%201`, {
        headers: {
            "Authorization": `Bearer ${AIRTABLE_TOKEN}`
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log('Loaded Data:', data);
        const taskList = document.getElementById("taskList");
        taskList.innerHTML = '';
        // Reverse the array to show newest first
        data.records.reverse().forEach(record => {
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
        // Hide the input form before adding task
        document.querySelector('.new-to-do-input').classList.remove('active');
        document.getElementById('todoForm').classList.remove('active');
        document.getElementById('taskList').classList.remove('input-active');
        
        // Small delay before adding the new task
        setTimeout(() => {
            addTask(taskText);
            lastSubmittedValue = taskText;
            taskInput.value = "";
        }, 50);
    }
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
        
        // Add new animation classes
        li.classList.add('new-item');
        taskList.insertBefore(li, taskList.firstChild);
        
        // Trigger the animation after a brief delay
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                li.classList.add('show');
            });
        });
    })
    .catch(err => {
        console.error("Error adding task:", err);
        alert("Error adding task. Check console for details.");
    });
}

// Replace the existing delete function with this new one
function deleteCompletedTasks() {
    const bin = document.getElementById('deleteAllBtn');
    const binRect = bin.getBoundingClientRect();
    
    fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Table%201`, {
        headers: {
            "Authorization": `Bearer ${AIRTABLE_TOKEN}`
        }
    })
    .then(response => response.json())
    .then(data => {
        const completedRecords = data.records.filter(record => record.fields.done === true);
        const completedTasks = document.querySelectorAll('.task-item.task-done');
        const remainingTasks = document.querySelectorAll('.task-item:not(.task-done)');
        
        // Mark remaining tasks
        remainingTasks.forEach(task => task.classList.add('remaining'));
        
        // Add animation before deletion with slight delay between each item
        const animationPromises = Array.from(completedTasks).map((task, index) => {
            return new Promise(resolve => {
                task.classList.add('deleting');
                task.addEventListener('animationend', () => {
                    task.remove();
                    resolve();
                }, { once: true });
            });
        });

        return Promise.all([
            Promise.all(animationPromises),
            completedRecords
        ]);
    })
    .then(([_, completedRecords]) => {
        // Delete from Airtable after animations complete
        return Promise.all(completedRecords.map(record => 
            fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Table%201/${record.id}`, {
                method: 'DELETE',
                headers: {
                    "Authorization": `Bearer ${AIRTABLE_TOKEN}`
                }
            })
        ));
    })
    .then(() => {
        // Remove the remaining class after a delay
        setTimeout(() => {
            document.querySelectorAll('.task-item.remaining').forEach(task => {
                task.classList.remove('remaining');
            });
        }, 500);
    })
    .catch(err => {
        console.error("Error deleting completed tasks:", err);
        alert("Error deleting completed tasks. Check console for details.");
    });
}

// Update the delete button event listener
document.getElementById("deleteAllBtn").addEventListener("click", deleteCompletedTasks);

// Replace the existing add button click handler with this:
document.querySelector('.add-button').addEventListener('click', function(e) {
    const form = document.querySelector('.new-to-do-input');
    const todoForm = document.getElementById('todoForm');
    const taskList = document.getElementById('taskList');
    
    if (!form.classList.contains('active')) {
        form.classList.add('active');
        todoForm.classList.add('active');
        taskList.classList.add('input-active');
        document.getElementById('taskInput').focus();
    } else {
        form.classList.remove('active');
        todoForm.classList.remove('active');
        taskList.classList.remove('input-active');
    }
});

// ...existing code...
