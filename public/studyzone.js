let timer;
let secondsLeft = 0;
let sessionLogs = JSON.parse(localStorage.getItem("studySessions")) || [];
let tasks = JSON.parse(localStorage.getItem("kanbanTasks")) || {
  current: [],
  ongoing: [],
  completed: []
};

function startTimer() {
  const minutes = parseInt(document.getElementById("timerInput").value);
  if (isNaN(minutes) || minutes <= 0) return alert("Invalid time");

  secondsLeft = minutes * 60;
  updateTimerDisplay();

  timer = setInterval(() => {
    secondsLeft--;
    updateTimerDisplay();
    if (secondsLeft <= 0) {
      clearInterval(timer);
      alert("Time's up!");
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timer);
}

function updateTimerDisplay() {
  const m = Math.floor(secondsLeft / 60);
  const s = secondsLeft % 60;
  document.getElementById("timerDisplay").textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function logSession() {
  const now = new Date().toLocaleString();
  const duration = document.getElementById("timerDisplay").textContent;
  sessionLogs.push(`${now} — ${duration}`);
  localStorage.setItem("studySessions", JSON.stringify(sessionLogs));
  renderSessionLogs();
  stopTimer();
}

function renderSessionLogs() {
  const log = sessionLogs.map(s => `<div>${s}</div>`).join("");
  document.getElementById("sessionLog").innerHTML = log;
}

function addTask() {
  const input = document.getElementById("todoInput");
  const text = input.value.trim();
  if (!text) return;
  tasks.current.push({ text });
  input.value = "";
  saveTasks();
  renderTasks();
}

function moveTask(stage, index, toStage) {
  const item = tasks[stage][index];
  tasks[stage].splice(index, 1);
  tasks[toStage].push(item);
  saveTasks();
  renderTasks();
}

function saveTasks() {
  localStorage.setItem("kanbanTasks", JSON.stringify(tasks));
}

function renderTasks() {
    ["current", "ongoing", "completed"].forEach(stage => {
      const container = document.getElementById(`todo-${stage}`);
      container.innerHTML = `<h3>${stage[0].toUpperCase() + stage.slice(1)}</h3>`;
      tasks[stage].forEach((task, index) => {
        const card = document.createElement("div");
        card.className = "todo-card";
        let moveLeftBtn = "";
        let moveRightBtn = "";
  
        if (stage === "ongoing") {
          moveLeftBtn = `<button class="btn" onclick="moveTask('ongoing', ${index}, 'current')">←</button>`;
          moveRightBtn = `<button class="btn" onclick="moveTask('ongoing', ${index}, 'completed')">→</button>`;
        } else if (stage === "current") {
          moveRightBtn = `<button class="btn" onclick="moveTask('current', ${index}, 'ongoing')">→</button>`;
        } else if (stage === "completed") {
          moveLeftBtn = `<button class="btn" onclick="moveTask('completed', ${index}, 'ongoing')">←</button>`;
        }
  
        card.innerHTML = `
          <div>${task.text}</div>
          <div style="margin-top: 5px;">${moveLeftBtn} ${moveRightBtn}</div>
        `;
        container.appendChild(card);
      });
    });
  }
     

  function generateFlowchart() {
    const fileInput = document.getElementById('flowchartUpload');
    const file = fileInput.files[0];
  
    if (!file) {
      alert("Upload a PDF first");
      return;
    }
  
    const formData = new FormData();
    formData.append("file", file);
  
    fetch("https://itsnotopia-87q9.vercel.app/flowchart", {
      method: "POST",
      body: formData
    })
    
      .then(response => response.json())
      .then(data => {
        const renderDiv = document.getElementById("flowchart-render");
        renderDiv.innerHTML = `<img src="${data.imageUrl}" alt="Generated Flowchart" style="max-width: 100%; border-radius: 8px;" />`;
      
        const img = document.createElement("img");
        img.src = `https://itsnotopia-87q9.vercel.app${data.imageUrl}`;

        img.alt = "Generated Flowchart";
        img.style.maxWidth = "100%";
        img.style.border = "1px solid #ccc";
        img.style.marginTop = "10px";
      
        renderDiv.appendChild(img);
      })
      
      
      .catch(error => {
        console.error("Flowchart generation failed:", error.message);
        document.getElementById("flowchart-render").innerText = "Flowchart generation failed. See console for details.";
      });
  
    fileInput.value = "";
  }
  

// INITIALIZE
renderSessionLogs();
renderTasks();
