import axios from "axios";
import { useState, useEffect } from "react";
import "./App.css";
import Navbar from "./Components/Navbar/Navbar";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Tiles from "./Components/Tiles/Tiles";
import Table from "./Components/Table/Table";
import Login from "./Components/Login/Login";

function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const fetchData = async () => {
    await axios.get("https://dns-manager-mxbz.vercel.app/getHostedZones").then((res) => {
      setData(res.data.HostedZones);
      setLoading(false);
    });
  };
  useEffect(() => {
    fetchData();
  }, []);
  return (
    <BrowserRouter>
      <>
        <Navbar />
        <div className="App">
          <Routes>
            <Route path="/" element={<Tiles hostedZones={data} />} />
            <Route path="/domains" element={<Table />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </div>
      </>
    </BrowserRouter>
  );
}

export default App;
