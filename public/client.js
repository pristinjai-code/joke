// Connect to WebSocket server
const socket = io();

const positions = {
  HEAD_GIRL: ["Aber Prisca", "Joanita Ameri", "Tracy Teddy"],
  ASS_HEAD_GIRL: ["Juan Scovia", "Mazira Jane"],
  UNSA_PRESIDENT: ["Pamela Grace", "Agnes Joyce"],
  UNSA_SPEAKER: ["Morio Lydia", "Drabaa Sphie"],
  HEALTH_PREFECT: ["Muraa Brenda", "Bakoru Juliet"],
  VICE_HEALTH_PREFECT: ["Atimaku Grace"],
  EDUCATION_DISCIPLINE: ["Andrea Atonia"],
  VICE_EDUCATION_DISCIPLINE: ["Martha Mukisa"]
};

const candidateClass = {
  "Aber Prisca": "S5", "Joanita Ameri": "S5", "Tracy Teddy": "S5",
  "Juan Scovia": "S3", "Mazira Jane": "S3",
  "Pamela Grace": "S5", "Agnes Joyce": "S5",
  "Morio Lydia": "S3", "Drabaa Sphie": "S3",
  "Muraa Brenda": "S5", "Bakoru Juliet": "S5",
  "Atimaku Grace": "S3",
  "Andrea Atonia": "S5",
  "Martha Mukisa": "S3"
};

const positionLabels = {
  HEAD_GIRL: "👑 HEAD GIRL",
  ASS_HEAD_GIRL: "🌟 ASSISTANT HEAD GIRL",
  UNSA_PRESIDENT: "🏆 UNSA PRESIDENT",
  UNSA_SPEAKER: "🎤 UNSA SPEAKER",
  HEALTH_PREFECT: "⚕️ HEALTH PREFECT",
  VICE_HEALTH_PREFECT: "🏥 VICE HEALTH PREFECT",
  EDUCATION_DISCIPLINE: "📖 EDUCATION & DISCIPLINE",
  VICE_EDUCATION_DISCIPLINE: "📚 VICE EDUCATION & DISCIPLINE"
};

let currentCredential = null;
let allVotes = [];
let electionOpen = true;

// Tab Switching
function switchTab(event, tabName) {
  document.querySelectorAll(".tab-content").forEach(tab => tab.classList.remove("active"));
  document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));
  document.getElementById(tabName).classList.add("active");
  event.target.classList.add("active");
  
  if (tabName === "board") {
    updateStats();
  }
}

// Show Alert
function showAlert(elementId, message, type) {
  const el = document.getElementById(elementId);
  if (el) el.innerHTML = `<div class="alert ${type}">${message}</div>`;
}

// Update Status Box
function updateStatusBox() {
  fetch('/api/election-status')
    .then(res => res.json())
    .then(data => {
      const status = data.isOpen ? "🟢 ELECTION OPEN" : "🔴 ELECTION CLOSED";
      document.getElementById("statusBox").innerHTML = `
        <div class="alert ${data.isOpen ? 'success' : 'error'}">${status}</div>
        <p class="muted">Total Votes: <span style="color:var(--primary)">${data.totalVotes}</span></p>
      `;
      electionOpen = data.isOpen;
    })
    .catch(err => console.error('Status error:', err));
}

// Get Credential
document.getElementById("issueBtn").onclick = async () => {
  const id = document.getElementById("studentId").value.trim().toUpperCase();
  if (!id) {
    showAlert("eligibilityMsg", "❌ Student ID cannot be empty", "error");
    return;
  }
  
  try {
    const response = await fetch('/api/issue-credential', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId: id })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      currentCredential = data.credential;
      document.getElementById("cred").textContent = data.credential;
      document.getElementById("ballot").classList.remove("hidden");
      showAlert("eligibilityMsg", "✓ Credential issued", "success");
    } else {
      showAlert("eligibilityMsg", `❌ ${data.error}`, "error");
    }
  } catch (error) {
    showAlert("eligibilityMsg", `❌ Error: ${error.message}`, "error");
  }
};

// Cast Vote
document.getElementById("castBtn").onclick = async () => {
  const id = document.getElementById("studentId").value.trim().toUpperCase();
  
  if (!currentCredential) {
    showAlert("castMsg", "❌ Get credential first", "error");
    return;
  }
  
  const votes = {};
  let allFilled = true;
  Object.keys(positions).forEach(position => {
    const choice = document.querySelector(`input[name='${position}']:checked`)?.value;
    if (!choice) allFilled = false;
    votes[position] = choice;
  });
  
  if (!allFilled) {
    showAlert("castMsg", "❌ Select candidates for all positions", "error");
    return;
  }
  
  try {
    const response = await fetch('/api/cast-vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId: id, credential: currentCredential, votes })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      document.getElementById("tracker").textContent = data.tracker;
      document.getElementById("receipt").classList.remove("hidden");
      showAlert("castMsg", "✓ Vote cast successfully!", "success");
      
      setTimeout(() => {
        document.getElementById("studentId").value = "";
        document.getElementById("ballot").classList.add("hidden");
        document.getElementById("receipt").classList.add("hidden");
        document.getElementById("eligibilityMsg").innerHTML = "";
        document.getElementById("castMsg").innerHTML = "";
        document.querySelectorAll("input[type='radio']").forEach(radio => radio.checked = false);
        currentCredential = null;
        updateStatusBox();
      }, 2000);
    } else {
      showAlert("castMsg", `❌ ${data.error}`, "error");
    }
  } catch (error) {
    showAlert("castMsg", `❌ Error: ${error.message}`, "error");
  }
};

// Search Tracker
document.getElementById("searchBtn").onclick = async () => {
  const tracker = document.getElementById("trackerSearch").value.trim();
  
  try {
    const response = await fetch(`/api/search-tracker/${tracker}`);
    const vote = await response.json();
    
    if (response.ok) {
      let details = "✓ Found! Votes:<br>";
      Object.keys(vote.votes).forEach(pos => {
        if (vote.votes[pos]) {
          details += `<strong>${positionLabels[pos]}:</strong> ${vote.votes[pos]}<br>`;
        }
      });
      showAlert("searchResult", details, "success");
    } else {
      showAlert("searchResult", "❌ Tracker not found", "error");
    }
  } catch (error) {
    showAlert("searchResult", `❌ Error: ${error.message}`, "error");
  }
};

// Update Stats
function updateStats() {
  if (allVotes.length === 0) {
    document.getElementById("totalVotesDisplay").textContent = "0 Votes";
    document.getElementById("statsContent").innerHTML = "<p class='muted'>No votes yet. Be the first to vote!</p>";
    return;
  }
  
  const totalVotes = allVotes.length;
  document.getElementById("totalVotesDisplay").textContent = totalVotes + " Vote" + (totalVotes !== 1 ? "s" : "");
  
  let html = ``;
  
  Object.keys(positions).forEach(position => {
    const candidates = positions[position];
    const count = {};
    candidates.forEach(c => count[c] = 0);
    allVotes.forEach(b => {
      if (b.votes && b.votes[position]) count[b.votes[position]]++;
    });
    
    const sorted = candidates.slice().sort((a, b) => count[b] - count[a]);
    const winner = sorted[0] || "N/A";
    const runnerUp = sorted[1] || "N/A";
    const runnerUpVotes = count[runnerUp] || 0;
    
    const winnerVotes = count[winner] || 0;
    const maxVotes = Math.max(...candidates.map(c => count[c]));
    const percentage = maxVotes > 0 ? Math.round((winnerVotes / maxVotes) * 100) : 0;
    
    html += `<div style="background:var(--panel);border:2px solid var(--border);border-radius:10px;padding:16px;margin-bottom:16px">
      <div style="font-weight:800;color:var(--accent);margin-bottom:12px">${positionLabels[position]}</div>
      <div style="color:var(--success);margin-bottom:8px;font-weight:700">🏆 Winner: ${winner}</div>
      <div style="color:var(--text-muted);margin-bottom:12px">Class: ${candidateClass[winner]}</div>
      <div style="background:linear-gradient(90deg, var(--primary), var(--secondary));height:8px;border-radius:4px;margin:10px 0;overflow:hidden">
        <div style="width:${percentage}%;height:100%;background:linear-gradient(90deg, var(--accent), var(--warning))"></div>
      </div>
      <div style="font-size:12px;color:var(--text-muted);margin-bottom:12px">${winnerVotes} Vote${winnerVotes !== 1 ? 's' : ''} (${percentage}%)</div>
      ${runnerUp !== "N/A" ? `<div style="background:rgba(245,158,11,0.1);border:2px solid var(--warning);border-radius:8px;padding:12px;margin-top:8px;color:var(--warning)">🥈 Runner-Up: ${runnerUp} (${runnerUpVotes} votes) - Class: ${candidateClass[runnerUp]}</div>` : ""}
    </div>`;
  });
  
  document.getElementById("statsContent").innerHTML = html;
}

document.getElementById("refreshBoardBtn").onclick = updateStats;

// Admin Panel
document.getElementById("unlockBtn").onclick = async () => {
  const password = document.getElementById("adminPass").value;
  
  if (!password) {
    showAlert("authMsg", "❌ Enter password", "error");
    return;
  }
  
  // For demo, just check if password is correct
  if (password === "JORDAN") {
    document.getElementById("adminLock").classList.add("hidden");
    document.getElementById("adminPanel").classList.remove("hidden");
  } else {
    showAlert("authMsg", "❌ Wrong password", "error");
  }
};

document.getElementById("lockBtn").onclick = () => {
  document.getElementById("adminPanel").classList.add("hidden");
  document.getElementById("adminLock").classList.remove("hidden");
  document.getElementById("adminPass").value = "";
};

document.getElementById("openBtn").onclick = async () => {
  try {
    const response = await fetch('/api/open-election', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminPassword: "JORDAN" })
    });
    
    if (response.ok) {
      showAlert("adminMsg", "✓ Election opened", "success");
      updateStatusBox();
    } else {
      const data = await response.json();
      showAlert("adminMsg", `❌ ${data.error}`, "error");
    }
  } catch (error) {
    showAlert("adminMsg", `❌ Error: ${error.message}`, "error");
  }
};

document.getElementById("closeBtn").onclick = async () => {
  try {
    const response = await fetch('/api/close-election', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminPassword: "JORDAN" })
    });
    
    if (response.ok) {
      showAlert("adminMsg", "✓ Election closed", "success");
      updateStatusBox();
    } else {
      const data = await response.json();
      showAlert("adminMsg", `❌ ${data.error}`, "error");
    }
  } catch (error) {
    showAlert("adminMsg", `❌ Error: ${error.message}`, "error");
  }
};

document.getElementById("resetBtn").onclick = async () => {
  if (confirm("⚠️ Reset system? This cannot be undone!")) {
    try {
      const response = await fetch('/api/reset-system', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminPassword: "JORDAN" })
      });
      
      if (response.ok) {
        allVotes = [];
        updateStats();
        updateStatusBox();
        showAlert("adminMsg", "✓ System reset", "success");
      } else {
        const data = await response.json();
        showAlert("adminMsg", `❌ ${data.error}`, "error");
      }
    } catch (error) {
      showAlert("adminMsg", `❌ Error: ${error.message}`, "error");
    }
  }
};

document.getElementById("auditBtn").onclick = async () => {
  document.getElementById("auditLog").classList.toggle("hidden");
  if (!document.getElementById("auditLog").classList.contains("hidden")) {
    try {
      const response = await fetch('/api/audit-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminPassword: "JORDAN" })
      });
      
      const logs = await response.json();
      let html = "";
      logs.forEach(log => {
        html += `<div style="background:var(--bg-light);padding:12px;margin-bottom:8px;border-radius:6px;border-left:4px solid var(--primary)">
          <div style="font-weight:800;font-size:12px">${new Date(log.timestamp).toLocaleString()}</div>
          <div style="color:var(--primary);margin-top:4px">${log.action}</div>
        </div>`;
      });
      document.getElementById("auditContent").innerHTML = html || '<div class="muted">No events</div>';
    } catch (error) {
      document.getElementById("auditContent").innerHTML = '<div class="error">Error loading audit log</div>';
    }
  }
};

// Socket.io Events
socket.on('connect', () => {
  console.log('✅ Connected to server');
  socket.emit('request-votes');
});

socket.on('vote-update', (votes) => {
  allVotes = votes;
  updateStats();
  updateStatusBox();
});

socket.on('election-closed', () => {
  electionOpen = false;
  updateStatusBox();
});

socket.on('election-opened', () => {
  electionOpen = true;
  updateStatusBox();
});

socket.on('system-reset', () => {
  allVotes = [];
  updateStats();
  updateStatusBox();
});

socket.on('disconnect', () => {
  console.log('❌ Disconnected from server');
});

// Initialize
updateStatusBox();
updateStats();
