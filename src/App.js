import axios from "axios";
import { useState, useEffect } from "react";
import "./App.css";
import Navbar from "./Components/Navbar/Navbar";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Tiles from "./Components/Tiles/Tiles";
import Table from "./Components/Table/Table";

function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const fetchData = async () => {
    await axios.get("http://localhost:8080/getHostedZones").then((res) => {
      setData(res.data.HostedZones);
      setLoading(false);
    });
  };
  useEffect(() => {
    fetchData();
  }, []);
  return (
    <BrowserRouter>
      <div>
        <Navbar />
        <div className="App">
          <Routes>
            <Route path="/" element={<Tiles hostedZones={data} />} />
            <Route path="/domains" element={<Table />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
