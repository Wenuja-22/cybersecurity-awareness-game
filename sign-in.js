if (localStorage.getItem('isLoggedIn') === 'true') {
  window.location.href = 'index.html';
}

import { db } from "./firebase-config.js";
import { doc, setDoc, getDoc } from 
"https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

window.showToast = function(message, type = 'success') {
  let toast = document.getElementById('toast-notification');

  if(!toast) {
    toast = document.createElement('div');
    toast.id = 'toast-notification';
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.className = `toast-popup ${type}`;

  setTimeout(() => {
    toast.classList.add('active');
  }, 10);

  setTimeout(() => {
    toast.classList.remove('active');  
  }, 3500)
}

import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { db } from "./firebase-config.js";

async function saveLevelProgress(levelKey, newCorrectCount, newTotalAttempted) {
  const userEmail = localStorage.getItem('userEmail');
  if (!userEmail) return;

  const userId = userEmail.toLowerCase().replace(/[@.]/g, "_");
  const userDocRef = doc(db, "users", userId);

  try {
    await updateDoc(userDocRef, {
      [`levels.${levelKey}.correctCount`]: increment(newCorrectCount),
      [`levels.${levelKey}.totalAttempted`]: increment(newTotalAttempted)
    });
    console.log(`Progress for ${levelKey} saved successfully!`);
  }catch(error){
    console.error("Error updating level progress:", error);
  }
}

window.togglePassword = function(inputID, iconBtn) {
  const input = document.getElementById(inputID);
  const icon = iconBtn.querySelector('i') || iconBtn;
  if (input) {
    if (input.type === "password") {
      input.type = "text";
      icon.classList.remove("fa-eye");
      icon.classList.add("fa-eye-slash");
    }else{
      input.type = "password";
      icon.classList.remove("fa-eye-slash");
      icon.classList.add("fa-eye");
    }
  }
};

const initAuthApp = () => {
// Panel Flipping Logic
   const authCard = document.getElementById('authCard');
   const toSignupBtn = document.getElementById('to-signup');
   const toLoginBtn = document.getElementById('to-login');
   if (toSignupBtn && toLoginBtn && authCard) {
    toSignupBtn.addEventListener('click', (e) => {
      e.preventDefault();
      authCard.classList.add('flipped');
    });
    toLoginBtn.addEventListener('click', (e) => {
      e.preventDefault();
      authCard.classList.remove('flipped');
    });
  }

// ==========================================
// SIGN-UP HANDLER
// ==========================================
   const signUpForm = document.querySelector('.signup-panel form');
   if (signUpForm) {
    signUpForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fullName = document.getElementById('name')?.value.trim() || '';
      const email = document.getElementById('email')?.value.trim() || '';
      const dob = document.getElementById('dob')?.value || '';
      const gender = document.getElementById('gender')?.value || '';
      const district = document.getElementById('district')?.value.trim() || '';
      const password = document.getElementById('signupPassword')?.value || '';
      const confirmPassword = document.getElementById('confirmPassword')?.value || '';
      
      if (password !== confirmPassword) {
        showToast('Passwords do not match!', 'error');
        return;
      }

      const nameParts = fullName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      const submitBtn = signUpForm.querySelector('.main-btn');
      if (submitBtn) {
        submitBtn.textContent = "SAVING...";
        submitBtn.disabled = true;
      }
      try {
        const userId = email.toLowerCase().replace(/[@.]/g, "_");
        await setDoc(doc(db, "users", userId), {
          fullName: fullName,
          firstName: firstName,
          lastName: lastName,
          email: email,
          password: password,
          dateOfBirth: dob,
          gender: gender,
          district: district,
          createdAt: new Date().toISOString(),

          levels: {
            level1: { totalAttempted: 0, correctCount: 0 },
            level2: { totalAttempted: 0, correctCount: 0 },
            level3: { totalAttempted: 0, correctCount: 0 },
            level4: { totalAttempted: 0, correctCount: 0 },
            level5: { totalAttempted: 0, correctCount: 0 }
          }
        });
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('currentUsername', firstName);
        localStorage.setItem('userEmail', email);
        localStorage.setItem('awayTimestamp', Date.now().toString());
        showToast('Account created successfully!', 'success');        
        setTimeout(() => { 
          window.location.href = 'index.html'; 
        },1000);
      
      }catch(error) {
        console.error("Firestore Error:", error);
        showToast('Failed: ', + error.message, 'error');
      }
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "CREATE ACCOUNT";
      }
    });
  }

// ==========================================
// LOGIN HANDLER
// ==========================================
  const logInForm = document.querySelector('.login-panel form');
  if (logInForm) {
    logInForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail')?.value.trim();
      const password = document.getElementById('loginPassword')?.value;
      const loginBtn = logInForm.querySelector('.main-btn');
      if (!email || !password) {
        showToast('Please enter both email and password.', 'error');
        return;
      }
      if (loginBtn) {
        loginBtn.textContent = "VERIFYING...";
        loginBtn.disabled = 'true';
      }

      try {
        const userId = email.toLowerCase().replace(/[@.]/g, "_");
        const userDocRef = doc(db, "users", userId);
        const userSnapshot = await getDoc(userDocRef);

        if (!userSnapshot.exists()) {
          showToast('Account not found! Please sign up first.', 'error');
          return;
        }

        const userData = userSnapshot.data();
        if (userData.password !== password) {
          showToast('Invalid Password. Please try again.', 'error');
          return;
        }

        const firstName = userData.firstName || userData.fullName.split(' ')[0];
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('currentUsername', firstName);
        localStorage.setItem('userEmail', email);
        localStorage.setItem('awayTimestamp', Date.now().toString());
          
        if (loginBtn) loginBtn.textContent = "✓ SUCCESS";
        showToast(`Welcome back, ${firstName}!`, 'success');
        setTimeout(() => { 
          window.location.href = 'index.html'; 
        },800);      
      
      }catch (error) {
        console.error("Login Error:", error);
        showToast('Login failed. Please try again.', 'error');
      }finally{
        if (loginBtn) { 
          loginBtn.disabled = false;
          if (loginBtn.textContent === "VERIFYING...") {
            loginBtn.textContent = "Login";
          }
        }
      }
    });
  }
};

// Safe execution for ES Modules
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuthApp);
  } else {
    initAuthApp();
}


//BG
const canvas = document.getElementById('meshBg');
const ctx = canvas.getContext('2d');

let particles = [];
let width, height;

function resize() {
  const oldWidth = width;
  const oldHeight = height;
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;

  if (oldWidth && oldHeight && particles.length > 0) {
    particles.forEach(p => {
      p.x = (p.x / oldWidth) * width;
      p.y = (p.y / oldHeight) * height;
    });
  }
}

window.addEventListener('resize', resize);
resize();

//Floating particles
const particleCount = Math.floor(( width * height) / 18000);
for (let i = 0; i < particleCount; i++) {
  particles.push({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.6,
    vy: (Math.random() - 0.5) * 0.6,
    size: Math.floor(Math.random() * 4) + 8,
    color: Math.random() > 0.25 ? (Math.random() > 0.5 ? '#00f3ff' : '#0055ff') : '#ff9900',
    glow: Math.random() * 15 + 8
  });
}

function animate() {
  ctx.clearRect(0, 0, width, height);

  //BG gradient
  const bgGradient = ctx.createLinearGradient(0, 0, width, height);
  bgGradient.addColorStop(0, '#040812');
  bgGradient.addColorStop(0.5, '#0a1628');
  bgGradient.addColorStop(1, '#02050b');
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, width, height);

  for (let i = 0; i < particles.length; i++) {
    let p = particles[i];
    p.x += p.vx;
    p.y += p.vy;

    if (p.x < 0 || p.x > width) p.vx *= -1;
    if (p.y < 0 || p.y > height) p.vy *= -1;

    for (let j = i + 1; j < particles.length; j++) {
      let p2 = particles[j];
      let dx = p.x - p2.x;
      let dy = p.y - p2.y;
      let dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 160) {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p2.x, p2.y);

        let alpha = (1 - dist / 160) * 0.4;
        ctx.strokeStyle = p.color === '#ff9900' || p2.color === '#ff9900' ? `rgba(255, 153, 0, ${alpha})`:`rgba(0, 243, 255, ${alpha})`;
        ctx.lineWidth = 1.5;
        ctx.stroke(); 
      }
    }
    //Drawing glowing node points
    ctx.save();
    ctx.font = `${p.size}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseLine = 'middle';
    ctx.shadowBlur = p.glow;
    ctx.shadowColor = p.color;
    ctx.fillStyle = p.color;
    ctx.fillText('🔒', p.x, p.y);
    ctx.restore();
  }
  requestAnimationFrame(animate);
}
animate();




