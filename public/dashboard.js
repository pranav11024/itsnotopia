if (typeof BASE_URL === "undefined") {
  var BASE_URL = window.location.hostname.includes("localhost")
    ? "http://localhost:5000"
    : "https://itsnotopia.onrender.com";
}

//let currentSubject = "";
//let parsedQuiz = [];
//let currentQuestionIndex = 0;
//let userScore = 0;

 function createParticles() {
      const particlesContainer = document.getElementById('particles');
      const particleCount = 100; // Number of particles
      
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        // Random properties
        const size = Math.random() * 15 + 5;
        const posX = Math.random() * 100;
        const posY = Math.random() * 100 + 100; // Start below viewport
        const duration = Math.random() * 20 + 10;
        const delay = Math.random() * 10;
        
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${posX}%`;
        particle.style.top = `${posY}%`;
        particle.style.animationDuration = `${duration}s`;
        particle.style.animationDelay = `${delay}s`;
        
        // Randomly use primary or accent color
        particle.style.backgroundColor = Math.random() > 0.5 ? 'var(--primary)' : 'var(--accent)';
        
        particlesContainer.appendChild(particle);
      }
    }
    
    // Initialize particles
    createParticles();
   

function openSubject(subjectName, courseCode, credits) {
  currentSubject = subjectName.toLowerCase();
  document.getElementById("subject-title").innerText = subjectName;
  document.getElementById("course-code").innerText = courseCode;
  document.getElementById("course-credits").innerText = credits;
  document.getElementById("subject-container").style.display = "block";

  const role = localStorage.getItem("role") || "student";
  document.getElementById("upload-area").style.display = role === "teacher" ? "block" : "none";

  loadNotes(currentSubject);

  const driveLinks = {
    "software engineering": "https://drive.google.com/drive/folders/14JJKG2_fnbaibJ2C798KliTkvSM5P71E",
    "principles of programming language": "https://drive.google.com/drive/folders/1kJCELq9imz1dCB32RawvlwBe6EAuzsCS",
    "computer security": "https://drive.google.com/drive/folders/1n4GjB2WwCeuggQxuZGXfqoNry4Zg_8wn",
    "distributed systems": "https://drive.google.com/drive/folders/1n0aKr0y7eZQ5B3vHcstQT5ds9xfSrqX8",
    "ethical hacking": "https://drive.google.com/drive/folders/12cQBW6GF9V6w9PjuBAgFeTj3T6q6rSze",
    "deep learning for computer vision": "https://drive.google.com/drive/folders/1cz_ksdX7uA_3W4VpAZbcXMMDvFAsVdE-",
    "cloud computing": "https://drive.google.com/drive/folders/1WThFzpQwbnMdWGleJ2HvzBFWBIGHAXBp",
    "mobile and wireless security": "https://drive.google.com/drive/folders/1Y1XylMXVEAp-Zav2tBo708zbHH7Q8jLS",
    "internet of things": "https://drive.google.com/drive/folders/1JIArzFHhDUZQsGB-8QCJ-4jdTq18R6mG",
    "neural networks and deep learning": "https://drive.google.com/drive/folders/1SEDWFyAhmP0168NRGSJYRU1hXsJ-w8KF",
    "time series analysis": "https://drive.google.com/drive/folders/1JwqtEL8QVMTiNuxjD4lbhQQBBanjzvqU",
  };
  
  const driveLink = driveLinks[currentSubject];
  if (driveLink) {
    document.getElementById("open-drive").href = driveLink;
  }
  

}

async function loadNotes(subject) {
  const list = document.getElementById("note-list");
  list.innerHTML = "";

  const driveMap = {
    "software engineering": "14JJKG2_fnbaibJ2C798KliTkvSM5P71E",
    "principles of programming language": "1kJCELq9imz1dCB32RawvlwBe6EAuzsCS",
    "computer security": "1n4GjB2WwCeuggQxuZGXfqoNry4Zg_8wn",
    "distributed systems": "1n0aKr0y7eZQ5B3vHcstQT5ds9xfSrqX8",
    "ethical hacking": "12cQBW6GF9V6w9PjuBAgFeTj3T6q6rSze",
    "deep learning for computer vision": "1cz_ksdX7uA_3W4VpAZbcXMMDvFAsVdE-",
    "cloud computing": "1WThFzpQwbnMdWGleJ2HvzBFWBIGHAXBp",
    "mobile and wireless security": "1Y1XylMXVEAp-Zav2tBo708zbHH7Q8jLS",
    "internet of things": "1JIArzFHhDUZQsGB-8QCJ-4jdTq18R6mG",
    "neural networks and deep learning": "1SEDWFyAhmP0168NRGSJYRU1hXsJ-w8KF",
    "time series analysis": "1JwqtEL8QVMTiNuxjD4lbhQQBBanjzvqU"
  };

  const folderId = driveMap[subject];
  if (!folderId) {
    list.innerHTML = '<p style="color: red;">No folder linked for this subject.</p>';
    return;
  }

  const embedLink = `https://drive.google.com/embeddedfolderview?id=${folderId}#list`;
  list.innerHTML = `
    <iframe src="${embedLink}" style="width:100%; height:500px; border:none; margin-bottom:20px;"></iframe>
  `;
}

function loadUserInfo() {
  const params = new URLSearchParams(window.location.search);
  const roleFromQuery = params.get("role");
  if (roleFromQuery) localStorage.setItem("role", roleFromQuery);

  const user = JSON.parse(localStorage.getItem("user"));
  if (user) {
    document.getElementById("user-role").textContent = user.role || "student";
    const userAvatar = document.getElementById("user-avatar");
    if (user.photo) {
      userAvatar.style.backgroundImage = `url(${user.photo})`;
      userAvatar.style.backgroundSize = "cover";
      userAvatar.style.backgroundPosition = "center";
    } else {
      const initials = user.name ? user.name.charAt(0).toUpperCase() : "U";
      userAvatar.textContent = initials;
    }
  }
}
loadUserInfo();

function uploadFile() {
  const fileInput = document.getElementById("file-upload");
  const file = fileInput.files[0];
  if (!file) return alert("No file selected");

  const chatbox = document.getElementById("chatbox");
  const userMessage = document.createElement("div");
  userMessage.className = "message user-message";
  userMessage.textContent = `Uploading file: ${file.name}...`;
  chatbox.appendChild(userMessage);

  const formData = new FormData();
  formData.append("file", file);

  fetch(`${BASE_URL}/upload`, {
    method: "POST",
    body: formData
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        userMessage.textContent = `File uploaded: ${file.name}. Ready for summarization.`;
        sendNoteToChatbot(data.text);
        generateQuizFromText(data.text);
      } else {
        alert("Failed to upload file");
        userMessage.textContent = `Failed to upload file: ${file.name}`;
      }
    })
    .catch(err => {
      console.error("Error uploading file:", err);
      alert("Error uploading file");
      userMessage.textContent = `Error uploading file: ${file.name}`;
    });

  fileInput.value = "";
}

function sendNoteToChatbot(noteContent) {
  const chatbotPanel = document.getElementById("chatbot-panel");
  if (!chatbotPanel.classList.contains("open")) chatbotPanel.classList.add("open");

  const chatbox = document.getElementById("chatbox");
  const userMessage = document.createElement("div");
  userMessage.className = "message user-message";
  userMessage.textContent = `Summarize the following note: \n\n${noteContent}`;
  chatbox.appendChild(userMessage);

  fetch(`${BASE_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: `Summarize this content: \n\n${noteContent}` })
  })
    .then(res => res.json())
    .then(data => {
      const botMessage = document.createElement("div");
      botMessage.className = "message bot-message";
      botMessage.textContent = data.response || "No response received.";
      chatbox.appendChild(botMessage);
      chatbox.scrollTop = chatbox.scrollHeight;
    })
    .catch(err => console.error("Chatbot error:", err));
}

function generateQuizFromText(text) {
  fetch(`${BASE_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: `Create a quiz with 10 multiple-choice questions from the content below. Format each question like this:

1. <question text>
A. <option>
B. <option>
C. <option>
D. <option>
Correct Answer: <A/B/C/D>

Use exactly this format.

Content:
${text}`
    })
  })
    .then(res => res.json())
    .then(data => {
      parsedQuiz = parseQuizData(data.response);
      currentQuestionIndex = 0;
      userScore = 0;
      document.getElementById("start-quiz-btn").style.display = "block";
    })
    .catch(err => console.error("Quiz generation error:", err));
}

function parseQuizData(rawText) {
  const questions = [];
  const blocks = rawText.split(/\n(?=\d+\.\s)/).filter(Boolean);

  for (const block of blocks) {
    const lines = block.trim().split("\n").filter(Boolean);
    const questionLine = lines.find(l => /^\d+\.\s/.test(l)) || "";
    const questionText = questionLine.replace(/^\d+\.\s*/, "").trim();

    const options = lines
      .filter(l => /^[A-D]\.\s*/i.test(l))
      .map(line => {
        const [_, label, text] = line.match(/^([A-D])\.\s*(.*)$/i) || [];
        return { label, text };
      });

    const answerLine = lines.find(l => /correct answer/i.test(l));
    const answerMatch = answerLine?.match(/Correct Answer:\s*([A-D])/i);
    const answer = answerMatch ? answerMatch[1].toUpperCase() : "";

    if (questionText && options.length === 4 && answer) {
      questions.push({ question: questionText, options, answer });
    }
  }

  return questions;
}

function renderModernQuiz() {
  const quizPanel = document.getElementById("quiz-container");
  quizPanel.innerHTML = "";
  quizPanel.style.display = "block";

  const q = parsedQuiz[currentQuestionIndex];
  if (!q) {
    quizPanel.innerHTML = `
      <div class="quiz-box">
        <h3>Quiz Completed</h3>
        <p>Your Score: ${userScore} / ${parsedQuiz.length}</p>
        <button onclick="restartModernQuiz()">Retake</button>
      </div>`;
    return;
  }

  const box = document.createElement("div");
  box.className = "quiz-box";

  box.innerHTML = `
    <div class="quiz-header">
      <span>Question ${currentQuestionIndex + 1} of ${parsedQuiz.length}</span>
      <span>Score: ${userScore}</span>
    </div>
    <h4>${q.question}</h4>
  `;

  q.options.forEach(opt => {
    box.innerHTML += `
      <div class="quiz-option">
        <label>
          <input type="radio" name="quiz" value="${opt.label}"> ${opt.label}. ${opt.text}
        </label>
      </div>`;
  });

  box.innerHTML += `<button onclick="nextQuestion()">Next</button>`;
  quizPanel.appendChild(box);
}

function nextQuestion() {
  const q = parsedQuiz[currentQuestionIndex];
  const selected = document.querySelector(`input[name="quiz"]:checked`);
  if (!selected) return alert("Please select an option");

  const val = selected.value.trim().toUpperCase();
  if (val === q.answer) userScore++;

  currentQuestionIndex++;
  renderModernQuiz();
}

function restartModernQuiz() {
  currentQuestionIndex = 0;
  userScore = 0;
  renderModernQuiz();
}

function logout() {
  localStorage.clear();
  window.location.href = "index.html";
}


