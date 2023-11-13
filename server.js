const app = require("./app");
const mongoose = require("mongoose");
mongoose
  .connect(
    "mongodb+srv://illia:DPVzxJG3RmADeb1Xcluster0.suukots.mongodb.net/?retryWrites=true&w=majority"
  )
  .then(
    app.listen(3000, () => {
      console.log("Server running. Use our API on port: 3000");
    })
  )
  .catch(() => {
    process.exit(1);
  });
