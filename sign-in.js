if (localStorage.getItem('isLoggedIn') === 'true') {
  window.location.href = 'index.html';
}

import { db } from "./firebase-config.js";
import { doc, setDoc, getDoc } from 
"https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

function showToast(message, type = 'success') {
  console.log("showToast called with:", message, type);

  const container = document.getElementById('toast-container');
  if (!container) {
    console.error("Error: #toast-container element not found in HTML!");
    return;
  } 
      
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    min-width: 280px;
    max-width: 360px;
    background: rgba(10, 22, 40, 0.95);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid ${type === 'error' ? '#ff3366' : '#00f3ff'};
    color: #ffffff;
    padding: 14px 20px;
    margin-bootom: 10px;
    border-radius: 14px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    font-size: 14px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 12px;
    animation: slideInRight 0.3s ease forwards;
    z-index: 99999;
  `;
  const iconClass = type === 'error' ? 'fa-circle-exclamation' : 'fa-circle-check';
  const iconColor = type === 'error' ? '#ff3366' : '#00ff66';

  toast.innerHTML = `
    <i class="fa-solid ${iconClass}" style="color: ${iconColor}; font-size: 18px;"></i>
    <span>${message}</span>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideOutRight 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
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
      if (submitBtn) submitBtn.textContent = "SAVING...";
      
      try {
        const userId = email.toLowerCase().replace(/[@.]/g, "_");
        await setDoc(doc(db, "users", userId), {
          fullName: fullName,
          firstName: firstName,
          lastName: lastName,
          email: email,
          dateOfBirth: dob,
          gender: gender,
          district: district,
          createdAt: new Date().toISOString()
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
        showToast('Failed to create account. Check connection.', 'error');
        if (submitBtn) submitBtn.textContent = "CREATE ACCOUNT";
      }
    });
  }

// ==========================================
// LOGIN HANDLER
// ==========================================
  const signInForm = document.querySelector('.login-panel form');
  if (signInForm) {
    signInForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail')?.value.trim() || '';
      const password = document.getElementById('loginPassword')?.value || '';
      const loginBtn = signInForm.querySelector('.main-btn');
      if (loginBtn) loginBtn.textContent = "VERIFYING...";

      try {
        const userId = email.toLowerCase().replace(/[@.]/g, "_");
        const userDocRef = doc(db, "users", userId);
        const userSnapshot = await getDoc(userDocRef);
        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          if (userData.password && userData.password !== password) {
            showToast('Invalid Password. Please try again.', 'error');
            if (loginBtn) loginBtn.textContent = "Login";
            return;
          }

          const firstName = userData.firstName ||
          userData.fullName.split(' ')[0];
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('currentUsername', firstName);
          localStorage.setItem('userEmail', email);
          localStorage.setItem('awayTimestamp', Date.now().toString());
          
          if (loginBtn) loginBtn.textContent = "✓ SUCCESS";
          showToast(`Welcome back, ${firstName}!`, 'success');
          setTimeout(() => { window.location.href = 'index.html'; 
        },800);      
      }else{
        showToast('No account found with this email. Please signup.', 'error');
        if (loginBtn) loginBtn.textContent = "Login";
      }
    }catch (error) {
      console.error("Login Error:", error);
      showToast('Login failed. Please try again.', 'error');
      if (loginBtn) loginBtn.textContent = "Login";
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



