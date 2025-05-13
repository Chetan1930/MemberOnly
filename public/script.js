// Select the flip container
const flipContainer = document.getElementById('flipBox');

// Event listener for switching to signup
document.getElementById('toSignup').addEventListener('click', () => {
  flipContainer.classList.add('show-signup');
});

// Event listener for switching to login
document.getElementById('toLogin').addEventListener('click', () => {
  flipContainer.classList.remove('show-signup');
});