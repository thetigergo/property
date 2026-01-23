import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // 👇 this is the part you asked about
  productionBrowserSourceMaps: true,
};

// next.config.js
module.exports = {
  basePath: "/property",
  devIndicators: false,
};

// next.config.js
//Alternatively, if you want to keep the indicator but move it to a different corner, you can configure its position:
/*module.exports = {
  devIndicators: {
    position: "top-right", // or 'top-left', 'bottom-right', 'bottom-left'
  },
};*/

export default nextConfig;
