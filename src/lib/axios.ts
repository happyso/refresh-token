import axios from "axios";

// Creates a new instance of axios
// Just export this instance and use it like a normal axios object
// but this time, the root endpoint is already set
// So, when you do axios.get("/personnel") under the hood it actually calls axios.get("http://<your-path-to-backend-uri>")
const instance = axios.create({
  baseURL: "http://localhost:8000", // can be http://localhost:8000
});

export default instance;
