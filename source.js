//  const passwordInput = document.getElementById('password');
//   const strengthContainer = document.getElementById('password-strength');
//   const strengthText = document.getElementById('strength-text');
//   const strengthFill = document.getElementById('strength-fill');
//   const strengthBar = document.querySelector('.strength-bar');

//   passwordInput.addEventListener('input', () => {
//     const val = passwordInput.value;

   
//     if (val.length === 0) {
//       strengthContainer.style.display = 'none';
//       return;
//     } else {
//       strengthContainer.style.display = 'flex';
//     }


//     let score = 0;
//     if (val.length >= 8) score++;
//     if (/[A-Z]/.test(val)) score++;
//     if (/[0-9]/.test(val)) score++;
//     if (/[^A-Za-z0-9]/.test(val)) score++;

    
//     if (score <= 1) {
//       strengthText.textContent = 'Password too weak!';
//       strengthText.style.color = '#f87171';
//       strengthFill.style.width = '25%';
//       strengthFill.style.backgroundColor = '#f87171';
//       strengthBar.style.height = '4px';
//     } else if (score === 2) {
//       strengthText.textContent = 'Medium strength';
//       strengthText.style.color = '#fbbf24';
//       strengthFill.style.width = '50%';
//       strengthFill.style.backgroundColor = '#fbbf24';
//       strengthBar.style.height = '5px';
//     } else if (score === 3) {
//       strengthText.textContent = 'Good password';
//       strengthText.style.color = '#38bdf8';
//       strengthFill.style.width = '75%';
//       strengthFill.style.backgroundColor = '#38bdf8';
//       strengthBar.style.height = '6px';
//     } else {
//       strengthText.textContent = 'Password strong enough';
//       strengthText.style.color = '#4ade80';
//       strengthFill.style.width = '100%';
//       strengthFill.style.backgroundColor = '#4ade80';
//       strengthBar.style.height = '8px'; 
//     }
//   });
/*
Criteria: Uppercase and Lowercase, Symbols, Numbers, Maximum 64 characters, Minimum 8.
*/

const rules = {
  minlen:   p => p.length >= 8,
  maxlen: p => p.length <= 64,
  upper: p => /[A-Z]/.test(p),
  lower: p => /[a-z]/.test(p),
  num:   p => /[0-9]/.test(p),
  sym:   p => /[^A-Za-z0-9]/.test(p),
}
const ruleCount = Object.keys(rules).length

const reasons = {
    minlen: {
        reason: "Passwordi është tepër i shkurtë!",
        description: "Passwordet e shkurtra nuk janë të sigurta, kan më pak kombinime të mundshme të karakterve, kjo i lejon hakerët të suljmojnë nepërmjet brute-force (Aksesim me forcë)",
        image: "./assets/images/BRUTE-FORCE-PLACEHOLDER.webp"
    },
    maxlen: {
        reason: "Passwordi është teper i gjatë!",
        description: "Passwordet tepër të gjata nuk jane domosdoshmërisht të pa sigurta, por sistemet e programuara dobët mund të kene probleme probleme me përpunimin e tyre"
    },
    upper: {
        reason: "Passwordi nuk ka shkronjë të madhe!",
        description: "Passwordet që përmbajnë vetem shkronja të vogla kanë më pak kombinime të mundshme\n<i>Fakt: Password me 8 shkronja që përmban vetëm shkronja të vogla ka 208 billion kombinime të mundshme\nKurse me shkronja të vogla dhe të mëdha <b>53.5 trillion kombinime.</b></i>"
    },
    lower: {
        reason: "Passwordi nuk ka shkronjë të vogla!",
        description: "Passwordet që përmbajnë vetem shkronja të madhe kanë më pak kombinime të mundshme\n<i>Fakt: Password me 8 shkronja që përmban vetëm shkronja të made ka 208 billion kombinime të mundshme\nKurse me shkronja të vogla dhe të mëdha <b>53.5 trillion kombinime.</b></i>"
    },
num: {
        reason: "Passwordi nuk ka numra!",
        description: "Passwordet që nuk përmbajnë numra mund të kenë më pak kombinime të mundshme, duke e bërë më të lehtë zbulimin e tyre përmes sulmeve Brute Force.\n<i>Fakt: Një fjalëkalim me 8 shkronja ka vetëm 53.5 trilionë kombinime.\nKurde Shkronja dhe numra <b>218 trilionë kombinime</b></i>"
    },
    sym: {
        reason: "Passwordi nuk ka simbols!",
        description: "Passwordet që nuk përmbajnë simbola mund të kenë më pak kombinime të mundshme, duke e bërë më të lehtë zbulimin e tyre përmes sulmeve Brute Force.\n<i>Fakt: Një fjalëkalim me 8 shkronja dhe numra ka vetëm 218 trilionë kombinime.\nKurde Shkronja, numra dhe simbole <b>6.63 quadrillion kombinime</b></i>"
    }
}

const PasswordBox = document.getElementById("password")
const issueBox = document.getElementById("issuebox")
const issueReason = document.getElementById("issue-reason")
const issueDescription = document.getElementById("issue-description")
const issueImage = document.getElementById("issue-image")
const strengthContainer = document.getElementById("password-strength")
const strengthText = document.getElementById("strength-text")
const strengthFill = document.getElementById("strength-fill")

PasswordBox.addEventListener("input", e => {
    const p = e.target.value
    if (p === "") {
        issueBox.style.display = "none"
        strengthContainer.style.display = "none"
        return;
    }

    let met = 0
    let firstFailure 
    for (const rule in rules){
        const pass = rules[rule](p)
        if (pass) {
            met ++;
        } else if (!firstFailure){
            firstFailure = rule
        }
    }

    const progress = met/ruleCount
    strengthContainer.style.display = "flex"
    strengthFill.style.width = (progress * 100) + "%"

    if (met === ruleCount) { // Pass
        issueBox.style.display = "none"
        strengthText.textContent = "Password strong enough"
        strengthText.style.color = "#4ade80"
        strengthFill.style.backgroundColor = "#4ade80"
    } else { // Fail
          const info = reasons[firstFailure]
          issueReason.textContent = info.reason
          issueDescription.innerHTML = info.description
          if (info.image) {
              issueImage.src = info.image
              issueImage.style.display = "block"
          } else {
              issueImage.style.display = "none"
          }
          issueBox.style.display = "block"
          strengthText.textContent = "Password too weak!"
          strengthText.style.color = "#f87171"
          strengthFill.style.backgroundColor = "#f87171"
    }
})
