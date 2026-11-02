document.addEventListener('DOMContentLoaded', () => {
  const buttons = document.querySelectorAll('.glass-btn'); 
  buttons.forEach((btn) => { 
    let canvas = btn.querySelector('canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.className = 'liquid-canvas';
      btn.prepend(canvas);
    }

    const ctx = canvas.getContext('2d'); 
    const hexColor = btn.dataset.color || '#3a86ff'; 
    const hexColor2 = btn.dataset.color2 || hexColor;
    const fillLevel = parseFloat(btn.dataset.fill) || 0.35;
    let baseFill = 0.35;
    let currentFill = baseFill;
    let targetFill = baseFill;

    btn.addEventListener('mouseenter', () => {
      targetFill = 0.75;
    });
    btn.addEventListener('mouseleave', () => {
      targetFill = baseFill;
    });
    
    let width, height; 
    let step = 0; 
    
    function resize() { 
      const dpr = window.devicePixelRatio || 1; 
      width = btn.offsetWidth; 
      height = btn.offsetHeight;
      if (width === 0 || height === 0) return;

      canvas.width = width * dpr; 
      canvas.height = height * dpr; 
      ctx.scale(dpr, dpr); 
    }
    resize(); 
    window.addEventListener('resize', resize); 
    
    function hexToRGBA(hex, alpha) { 
      let c = hex.replace('#', '');
      if (c.length === 3) c = c.split('').map(x => x + x).join('');    
      const r = parseInt(c.substring(0, 2), 16);
      const g = parseInt(c.substring(2, 4), 16);
      const b = parseInt(c.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    
    function drawWave(offset, amplitude, frequency, color, fillTopY) {
      ctx.beginPath(); 
      ctx.moveTo(0, height); 
      for (let x = 0; x <= width; x += 2) {
        const y = fillTopY + 
          Math.sin(x * frequency + step + offset) * amplitude + 
          Math.cos(x * (frequency * 0.6) + step * 0.8) * (amplitude * 0.4); 
        ctx.lineTo(x, y);
      }

      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
    } 
    
    

    function animate() { 
      step += 0.07; 
      ctx.clearRect(0, 0, width, height);
      currentFill += (targetFill - currentFill) * 0.06;
      const targetY = height * (1 - currentFill);
      const gradBack = ctx.createLinearGradient(0, 0, width, 0);
      gradBack.addColorStop(0, hexToRGBA(hexColor, 0.4)); 
      gradBack.addColorStop(1, hexToRGBA(hexColor2, 0.75));

      const gradFront = ctx.createLinearGradient(0, 0, width, 0);
      gradFront.addColorStop(0, hexToRGBA(hexColor, 0.7)); 
      gradFront.addColorStop(1, hexToRGBA(hexColor2, 0.95));

      drawWave(0, 4, 0.03, gradBack, targetY); 
      drawWave(Math.PI * 0.8, 5, 0.025, gradFront, targetY)
      ctx.beginPath(); 
      for (let x = 0; x <= width; x += 2) { 
        const y = targetY + 
          Math.sin(x * 0.025 + step + Math.PI * 0.8) * 5 +
          Math.cos(x * 0.015 + step * 0.8) * 2; 
        if (x === 0) ctx.moveTo(x, y); 
        else ctx.lineTo(x, y); 
      } 
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)'; 
      ctx.lineWidth = 1.5; 
      ctx.stroke(); 
      requestAnimationFrame(animate); 
    } 
    animate(); 
  }); 
});

  //Glow
document.querySelectorAll('.level').forEach(level => {
  const color = level.getAttribute("data-color");
    
  level.addEventListener('mouseenter', () => {
    level.style.boxShadow = `0 0 25px ${color}, inset 0 0 15px ${color}`;  
  });
  level.addEventListener('mouseleave', () => {
    level.style.boxShadow = `inset 0 0 20px rgba(255, 255, 255, 0.3),
                          0 4px 20px rgba(255, 255, 255, 0.2)`;
  });
});

const userPointElement = document.getElementById('userPoints');

//Buttons
const modal = document.getElementById('quiz-m');
const closeModalBtn = document.getElementById('close-modal');
const modalTitle = document.getElementById('modal-level-title');
const quizContainer = document.getElementById('quiz-container');
const progressFill = document.getElementById('progress-fill');
const progressText = document.getElementById('progress-text');
const coinPopup = document.getElementById('coin-popup');

let currentLevel = 1;
let questions = [];
let currentQuestionIndex = 0;
let correctAnswersCount = 0;
let currentScore = 0;
let levelscore = 0;

function getMaxUnlockedLevel() {
  return parseInt(localStorage.getItem('maxUnlockedLevel')) || 1;
}

function updateStatus() {
  const maxUnlocked = getMaxUnlockedLevel();
  document.querySelectorAll('.glass-btn').forEach(button => {
    const levelNum = parseInt(button.getAttribute('data-level'));
    const iconSpan = button.querySelector('.icon');

    if (levelNum > maxUnlocked) {
      button.classList.add('locked');
      if (iconSpan) iconSpan.textContent = '🔒';
    }else{
      button.classList.remove('locked');
      if (iconSpan) iconSpan.textContent = '🌐';
    }
  });
}

updateStatus();

document.querySelectorAll('.glass-btn').forEach(button => {
  button.addEventListener('click', async () => {
    const levelNum = parseInt(button.getAttribute('data-level'));
    const maxUnlocked = getMaxUnlockedLevel();

    if (levelNum > maxUnlocked) {
      alert(`Level ${levelNum} is locked! Complete previous level first.`);
      return;
    }

    currentLevel = levelNum;
    currentQuestionIndex = 0;
    correctAnswersCount = 0;
    currentScore = 0;
    levelscore = 0;

    modal.style.display = 'flex';
    setTimeout(() => {
      modal.classList.add('active')
    }, 10);
    modalTitle.tagName = `Loading Level ${levelNum}...`;
    quizContainer.innerHTML = '';
    updateProgressBar(0, 0);

    try {
      const response = await fetch(`level${levelNum}.json`);
      if (!response.ok) throw new Error('Could not load level data.');

      const data = await response.json();
      modalTitle.textContent = data.title;
      questions = data.questions;

      showCurrentQuestion();

    } catch (error) {
      modalTitle.textContent = "Error";
      quizContainer.innerHTML = `<p>Failed to load questions for level ${levelNum}. Make sure 'level${levelNum}.json' exists.</p>`;
      console.error(error);
    }
  });
});

function showCurrentQuestion() {
  if (currentQuestionIndex >= questions.length) {
    finishQuiz();
    return;
  }

  const q = questions[currentQuestionIndex];
  quizContainer.innerHTML = '';

  const wrapper = document.createElement('div');
  wrapper.className = 'quiz-step-transition';
  wrapper.innerHTML = `
    <p style="color: #aaa; font-size: 13px; margin-bottom: 10px;">Question ${currentQuestionIndex + 1} of ${questions.length}</p>
    <h3 style="color: #fff; margin-bottom: 15px;">${q.question}</h3>
    <div class="options-container" style="display: flex; flex-direction: column; gap: 10px;">
      ${q.options.map((option, index) => `
        <button class="option-btn" onclick="handleAnswerSelection(this, ${index}, ${q.answer})" style="padding: 12px; border-radius: 8px; 
        border: 1px solid rgba(255, 255, 255, 0.2); background: rgba(255, 255, 255, 0.05); color: #fff; cursor: pointer; text-align: left;
        transition: background 0.2s;">
          ${option}
        </button>
      `).join('')}
    </div>
  `;
  
  quizContainer.appendChild(wrapper);
  
  requestAnimationFrame(() => {
    wrapper.classList.add('active');
  });

  updateProgressBar(currentQuestionIndex, questions.length);
}

function handleAnswerSelection(selectedBtn, selectedIndex, correctIndex) {
  const parentGroup = selectedBtn.parentElement;
  const buttons = parentGroup.querySelectorAll('.option-btn');

  buttons.forEach(btn => btn.disabled = true);

  if (selectedIndex === correctIndex) {
    selectedBtn.style.background = 'rgba(0, 255, 102, 0.3)';
    selectedBtn.style.borderColor = '#00ff66';
    correctAnswersCount++;
    levelscore += 3;

    const currentTotal = parseInt(localStorage.getItem('totalUserPoints')) || 0;
    const newTotal = currentTotal + 3;
    localStorage.setItem('totalUserPoints', newTotal);
    animatePoints(currentTotal, newTotal);
    
    triggerCoinAnimation();
    if (coinPopup) {
      coinPopup.classList.add('show');
      setTimeout(() => coinPopup.classList.remove('show'), 800);
    }
  }else{
    selectedBtn.style.background = 'rgba(255, 0, 80, 0.3)';
    selectedBtn.style.borderColor = "#ff0050";
    buttons[correctIndex].style.background = 'rgba(0, 255, 102, 0.3)';
  }

  setTimeout(() => {
    currentQuestionIndex++;
    if (progressFill && progressText) {
      const percentage = (currentQuestionIndex / questions.length) * 100;
      progressFill.style.width = `${percentage}%`;
      progressText.textContent = `${currentQuestionIndex}/${questions.length}`;
    }
    showCurrentQuestion();
  }, 1500);
}

function updateProgressBar() {
  const totalQuestions = questions.length;
  
  if (totalQuestions === 0) return;

  const currentStep = currentQuestionIndex;
  const progressFill = document.querySelector('.progress-fill');
  const percent = (currentQuestionIndex / totalQuestions) * 100;

  if (progressFill) {
    progressFill.style.width = `${percent}%`;
  }else{
    const progressFill = document.querySelector('.progress-fill') || document.getElementById('progress-fill');
    if (progressFill) {
      progressFill.style.width = `${percent}%`;
    }
  }
}

function triggerCoinAnimation() {
  if (coinPopup) {
    coinPopup.classList.add('show');
    setTimeout(() => {
      coinPopup.classList.remove('show');
    }, 1000);
  }  
}

window.selectOption = function(element, selected, correct) {
  const parentGroup = element.parentElement;
  const buttons = parentGroup.querySelectorAll('.option-btn');

  buttons.forEach(btn => btn.disabled = true);

  if (selected === correct) {
    element.style.background = 'rgba(0, 255, 102, 0.3)';
    element.style.borderColor = "#00ff66";
    correctAnswersCount++;
    currentScore += 3;
    triggerCoinAnimation();
  }else{
    element.style.background = 'rgba(255, 0, 80, 0.3)';
    element.style.borderColor = "#ff0050";
    buttons[correct].style.background = 'rgba(0, 255, 102, 0.3)';
  }

  setTimeout(() => {
    currentQuestionIndex++;
    updateProgressBar(currentQuestionIndex, questions.length);
    showCurrentQuestion();
  }, 1000);
}

function finishQuiz() {
  const totalQuestions = questions.length;
  const finalPercent = totalQuestions > 0 ? (correctAnswersCount / totalQuestions) * 100 : 0;
  const progressFill = document.querySelector('.progress-fill');
  if (progressFill) {
    progressFill.style.width = `${finalPercent}%`;
  }

  if (currentScore > 0) {
    const currentTotal = parseInt(localStorage.getItem('totalUserPoints')) || 0;
    const newTotal = currentTotal + currentScore;
    localStorage.setItem('totalUserPoints', newTotal);
    animatePoints(currentTotal, newTotal);
  }
  
  quizContainer.innerHTML = `
    <div class="finish-screen-animation" style="text-align: center; padding: 20px;">
      <h3 style="color: #00ff66; font-size: 24px; margin-botton: 12px;">Level Complete! 🎉</h3>
      <p style="font-size: 16px; color: #fff; margin-botton: 12px;">You got ${correctAnswersCount} out of ${questions.length} correct.</p>
      <p style="font-size: 18px; color: #ffbe0b; font-weight: bold; margin-top: 12px;">Total Score +${levelscore} 🪙</p>
    </div>
  `;
  
  setTimeout(() => {
    const maxUnlocked = getMaxUnlockedLevel();
      
    if (currentLevel == maxUnlocked && currentLevel < 5) {
      localStorage.setItem('maxUnlockedLevel', currentLevel + 1);
      updateStatus();
      showCyberToast(`Awesome! Level ${currentLevel} Completed! Level ${currentLevel + 1} is now unlocked!`, '🚀');
    }else{
      showCyberToast(`Level ${currentLevel} Completed Successfully!`, '🎉');
    }
    closeModal();
  }, 3000);
}

function showCyberToast(message, icon = '🚀', duration = 4000) {
  const toast = document.getElementById('cyber-toast');
  const msgElement = document.getElementById('toast-message');
  const iconElement = document.getElementById('toast-icon');

  if (!toast || !msgElement) return;

  msgElement.textContent = message;
  if (iconElement) iconElement.textContent = icon;

  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}

function closeModal() {
  let pointsToCommit = levelscore;
  levelscore = 0;
  if (pointsToCommit > 0) {
    const currentTotal = parseInt(localStorage.getItem('totalUserPoints')) || 0;
    const newTotal = currentTotal + levelscore;
    localStorage.setItem('totalUserPoints', newTotal);
  }

  modal.classList.remove('active');

  setTimeout(() => {
    modal.style.display = 'none';
    if (pointsToCommit > 0) {
      const finalTotal = parseInt(localStorage.getItem('totalUserPoints')) || 0;
      const previousTotal = finalTotal - pointsToCommit;
      animatePoints(previousTotal, finalTotal);
    }
  }, 300);

    
  
  modal.classList.remove('active');
  setInterval(() => {
    modal.style.display = 'none'
  }, 300);
}

closeModalBtn.addEventListener('click', closeModal);

closeModalBtn.addEventListener('click', () => {
  modal.style.display = 'none';
});

//User Data initialize
let user = {
  name: "User",
  points: 0
};

//User Name
const userNameElement = document.getElementById("username");
if (userNameElement) {
  const storedFirstName = localStorage.getItem("currentUsername");
  userNameElement.textContent = storedFirstName ? storedFirstName : user.name;
}

//Update Points when score

document.addEventListener('DOMContentLoaded', () => {
  const userPointElement = document.getElementById('userPoints')
  const savedPoints = parseInt(localStorage.getItem('totalUserPoints')) || 0;
  if (userPointElement) {
    userPointElement.textContent = savedPoints;
  }
});

//Points Countdown
function animatePoints(oldVal, newVal) {
  if (!userPointElement) return;
  const duration = 1000;
  let startTime = null;
  
  function step(currentTime) {
    if (!startTime) startTime = currentTime;
    const progress = Math.min((currentTime - startTime) / duration, 1);
    const currentCount = Math.floor(oldVal + progress * (newVal - oldVal));

    userPointElement.textContent = currentCount;

    if (progress<1) {
      requestAnimationFrame(step);
    }else{
      userPointElement.textContent = newVal;
    }
  }
  requestAnimationFrame(step);
}

//Cyber Background 
document.addEventListener('DOMContentLoaded', () => { 
  const bgCanvas = document.getElementById('cyber-bg'); 
  if (!bgCanvas) return; 
  const ctx = bgCanvas.getContext('2d'); 
  
  function resizeCanvas() { 
    bgCanvas.width = window.innerWidth; 
    bgCanvas.height = window.innerHeight;
  } 
  resizeCanvas(); 
  
  window.addEventListener('resize', resizeCanvas); 
  const characters = ['0', '1']; 
  
  // Increased font size from 16 to 24 reduces active rendering columns by 35% 
  const fontSize = 24; 
  let columns = Math.floor(bgCanvas.width / fontSize); 
  let drops = Array(columns).fill(1); 
  let lastTime = 0; 
  const fps = 20; 
  
  // Capped at 20 FPS to keep CPU usage super low 
  const interval = 1000 / fps;
  function drawMatrix(timestamp) { 
    requestAnimationFrame(drawMatrix); 
    const delta = timestamp - lastTime; 
    if (delta < interval) return; 
    
    // Skip frames to prevent CPU lag 
    lastTime = timestamp - (delta % interval); 
    
    // Trail overlay effect 
    ctx.fillStyle = 'rgba(5, 8, 17, 0.15)'; 
    ctx.fillRect(0, 0, bgCanvas.width, bgCanvas.height); 
    ctx.font = `bold ${fontSize}px monospace`; 
    for (let i = 0; i < drops.length; i++) { const text = characters[Math.floor(Math.random() * characters.length)]; 
      ctx.fillStyle = Math.random() > 0.85 ? '#00f3ff' : '#0055cc'; 
      const x = i * fontSize; const y = drops[i] * fontSize; ctx.fillText(text, x, y); 
      if (y > bgCanvas.height && Math.random() > 0.975) { drops[i] = 0; } drops[i]++;
    }
  } requestAnimationFrame(drawMatrix); 
});

document.addEventListener('DOMContentLoaded', () => {
  const userSection = document.querySelector('.user-section');
  const userMenuToggle = document.getElementById('userMenuToggle');
  const logoutBtn = document.getElementById('logoutBtn');

  if (userMenuToggle && userSection) {
    userMenuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      userSection.classList.toggle('active');
    });

    document.addEventListener('click', () => {
      userSection.classList.remove('active');
    });
  }

  function executeLogout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUsername');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('awayTimestamp');
    window.location.href = 'sign-in.html';
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', executeLogout);
  }

  //30-min auto logout
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      localStorage.setItem('awayTimestamp', Date.now());
    }else if (document.visibilityState === 'visible') {
      const awayTime = localStorage.getItem('awayTimestamp');
      if (awayTime) {
        const elapsed = Date.now() - parseInt(awayTime);
        const thirtyMinutes = 30 * 60 * 1000;
        if (elapsed > thirtyMinutes) {
          executeLogout();
        }
        localStorage.removeItem('awayTimestamp');
      }
    }
  });

  let idleTimer;
  function resetIdleTimer() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      executeLogout();
    }, 30 * 60 * 1000);
  }

  ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'].forEach(event => {
    window.addEventListener(event, resetIdleTimer);
  });
  resetIdleTimer();
});











