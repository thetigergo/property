try {
  // const path = require("path");
  // const fs = require("fs");
  const packagePath = path.join(
    require.resolve("baseline-browser-mapping"),
    "..",
    "package.json"
  );
  const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
  console.log("Installed baseline-browser-mapping version:", pkg.version);
} catch (e) {
  console.error(
    "Could not determine version. Proceed to next step.",
    e.message
  );
}
