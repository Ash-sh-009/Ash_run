module.exports = {
  content: ["./public/**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        'deep-blue': '#0a0f2c',
        'space-blue': '#1d244f',
        'glow-cyan': '#00f6ff',
        'glow-purple': '#a659ff',
        'glow-pink': '#ff00aa',
        'ash-blue': '#61dafb',
        'ash-pink': '#f72585',
      },
      animation: {
        'fade-in': 'fadeIn 2s ease-in-out forwards',
        'glow-text': 'glowText 1.5s ease-in-out infinite alternate',
        'stars': 'animateStars 50s linear infinite',
        'particles': 'animateParticles 20s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0, transform: 'translateY(20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        glowText: {
          'from': { textShadow: '0 0 10px #fff, 0 0 20px #fff, 0 0 30px #a659ff, 0 0 40px #a659ff' },
          'to': { textShadow: '0 0 20px #fff, 0 0 30px #00f6ff, 0 0 40px #00f6ff, 0 0 50px #00f6ff' },
        },
        animateStars: {
          'from': { backgroundPosition: '0 0' },
          'to': { backgroundPosition: '0 1000px' },
        },
         animateParticles: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-1000px)' },
        },
      }
    },
  },
  plugins: [],
}
