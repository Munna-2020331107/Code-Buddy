export function initParallax() {
  const mainContainer = document.querySelector('.main-container');
  const welcomeContainer = document.querySelector('.welcome-container') as HTMLElement;
  const languageIcons = document.querySelector('.language-icons-container') as HTMLElement;
  const servicesGrid = document.querySelector('.services-grid') as HTMLElement;
  const decorations = document.querySelectorAll('.page-decoration');

  if (!mainContainer) return;

  let mouseX = 0;
  let mouseY = 0;
  let windowWidth = window.innerWidth;
  let windowHeight = window.innerHeight;

  const handleMouseMove = (e: MouseEvent) => {
    mouseX = (e.clientX / windowWidth - 0.5) * 2; // -1 to 1
    mouseY = (e.clientY / windowHeight - 0.5) * 2; // -1 to 1

    // Apply parallax effect to different elements with different intensities
    if (welcomeContainer) {
      welcomeContainer.style.transform = `
        translate3d(${mouseX * 20}px, ${mouseY * 20}px, 0)
        rotateX(${mouseY * 2}deg)
        rotateY(${mouseX * -2}deg)
      `;
    }

    if (languageIcons) {
      languageIcons.style.transform = `
        translate3d(${mouseX * 15}px, ${mouseY * 15}px, 0)
        rotateX(${mouseY * 1.5}deg)
        rotateY(${mouseX * -1.5}deg)
      `;
    }

    if (servicesGrid) {
      servicesGrid.style.transform = `
        translate3d(${mouseX * 10}px, ${mouseY * 10}px, 0)
        rotateX(${mouseY * 1}deg)
        rotateY(${mouseX * -1}deg)
      `;
    }

    // Move decorations in opposite direction for depth effect
    decorations.forEach((decoration, index) => {
      const intensity = index === 0 ? 30 : 20;
      (decoration as HTMLElement).style.transform = `
        translate3d(${mouseX * -intensity}px, ${mouseY * -intensity}px, 0)
      `;
    });
  };

  const handleResize = () => {
    windowWidth = window.innerWidth;
    windowHeight = window.innerHeight;
  };

  // Add event listeners
  window.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('resize', handleResize);

  // Return cleanup function
  return () => {
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('resize', handleResize);
  };
} 