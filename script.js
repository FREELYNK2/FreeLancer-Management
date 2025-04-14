function toggleDarkMode(classList = new Set()) {
    if (classList.has("dark-mode")) {
      classList.delete("dark-mode");
    } else {
      classList.add("dark-mode");
    }
    return classList.has("dark-mode");
  }
  
  function isEmailValid(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
  
  module.exports = { toggleDarkMode, isEmailValid };