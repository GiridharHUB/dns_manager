import React, { useEffect, useState } from "react";
import "./Tiles.css";
import loader from "../../Assets/img/loader.svg";
import axios from "axios";
import { Modal, Select, message, Popconfirm, notification } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { NavLink } from "react-router-dom";

const Tiles = ({ hostedZones }) => {
  const [hostedZoneData, setHostedZoneData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [api, contextHolder] = notification.useNotification();
  const openNotificationWithIcon = (type, errorTitle, error, placement) => {
    api[type]({
      message: errorTitle,
      description: error,
      placement,
      duration: 0,
    });
  };
  const deleteHostedZone = async (value) => {
    if (localStorage.getItem("isLoggedIn")) {
      await axios
        .delete(`https://dns-manager-mxbz.vercel.app/deleteHostedZone/${value}`)
        .then(() => {
          setIsModalOpen(false);
          window.location.reload();
          message.success("HostedZone Deleted Successfully.");
        })
        .catch((err) => {
          err.response.data
            ? openNotificationWithIcon(
                "error",
                "Failed to delete HostedZone",
                err.response.data,
                "topLeft"
              )
            : message.error("Failed to delete record.");
        });
    } else {
      message.error("Please login to Delete the HostedZone!");
    }
  };

  const createHostedZone = async () => {
    if (hostedZoneData.length === 0) {
      message.error("Please enter all the fields");
    } else {
      await axios
        .post("https://dns-manager-mxbz.vercel.app/createHostedZone", {
          hostedZoneData,
        })
        .then((res) => {
          setIsModalOpen(false);
          window.location.reload();
          message.success("HostedZone created successfully");
        })
        .catch((err) => {
          err.response.data
            ? openNotificationWithIcon(
                "error",
                "Failed to create HostedZone",
                err.response.data,
                "topLeft"
              )
            : message.error("Failed to create record.");
        });
    }
  };

  const handleOnChange = (e) => {
    setHostedZoneData({ ...hostedZoneData, [e.target.name]: e.target.value });
  };
  const handleOnTypeChange = (value) => {
    setHostedZoneData({ ...hostedZoneData, PrivateZone: value });
  };

  const showModal = () => {
    if (localStorage.getItem("isLoggedIn")) {
      setIsModalOpen(true);
    } else {
      message.error("Please login to Add a HostedZone!");
    }
  };

  useEffect(()=>{
    setTimeout(()=>{
      setLoading(false)
    }, 1000)
  })

  return (
    <>
    {contextHolder}
      <Modal
        title="Edit"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <button className="primary-btn" onClick={createHostedZone}>
            Submit
          </button>,
        ]}
      >
        <div className="edit-form">
          <label>Domain Name</label>
          <input
            className="domain-ip"
            name="Name"
            type="text"
            placeholder="example.com"
            onChange={(e) => handleOnChange(e)}
          />
        </div>
        <div className="edit-form">
          <label>Type (PrivateZone)</label>
          <Select
            defaultValue="false"
            onChange={handleOnTypeChange}
            options={[
              { value: true, label: "true" },
              { value: false, label: "false" },
            ]}
          />
        </div>
        <div className="edit-form">
          <label className="add-label">Description</label>
          <textarea
            className="domain-ip"
            type="text"
            name="comment"
            placeholder="This hosted zone is used for..."
            onChange={(e) => handleOnChange(e)}
          />
        </div>
      </Modal>
      <div className="table-header" style={{ width: "80%" }}>
        <h2 style={{ color: "#009879", margin: 0 }}>
          Hosted Zones ({hostedZones.length})
        </h2>
        <button className="primary-btn" onClick={() => showModal()}>
          Add a Hosted Zone
        </button>
      </div>
      {hostedZones && !loading ? (
        hostedZones?.map((value, index) => (
          <div className="tiles" key={index}>
            <div className="tiles-row">
              <Popconfirm
                placement="rightTop"
                title="Delete HostedZone"
                description="Are you sure to delete this HostedZone?"
                onConfirm={() => deleteHostedZone(value.Id.slice(12))}
                okText="Yes"
                cancelText="No"
              >
                <DeleteOutlined />
              </Popconfirm>
              <div className="tiles-header">
                <h2 style={{ margin: 0 }}>{value.Name}</h2>
                <h4 style={{ margin: 0, color: "rgba(0,0,0,0.4)" }}>
                  {value.Config.PrivateZone ? "Private" : "Public"}
                </h4>
              </div>
            </div>
            <NavLink
              to="/domains"
              className="tiles-footer"
              state={value.Id.slice(12)}
            >
              View
              <svg
                stroke="currentColor"
                fill="currentColor"
                strokeWidth="0"
                viewBox="0 0 24 24"
                className="inline-block"
                height="1em"
                width="1em"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path fill="none" d="M0 0h24v24H0z"></path>
                <path d="M6 6v2h8.59L5 17.59 6.41 19 16 9.41V18h2V6z"></path>
              </svg>
            </NavLink>
          </div>
        ))
      ) : (
        <div className="loader">
          <img src={loader} alt="" />
        </div>
      )}
    </>
  );
};

export default Tiles;
