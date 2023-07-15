/** @type {import('tailwindcss').Config} */
// eslint-disable-next-line no-undef
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx,vue}", "./index.html"],
  theme: {
    extend: {
      backgroundImage: {
        "vert-dark-gradient":
          "linear-gradient(180deg,transparent 13.94%, rgb(15 ,23 ,42) 54.73%)",
      },
      // 其他自定义类...
    },
  },
  plugins: [],
};
