import React, { useEffect, useState } from "react";
import "../Table/Table.css";
import {
  Breadcrumb,
  Modal,
  Select,
  Table,
  Space,
  Popconfirm,
  Drawer,
  message,
} from "antd";
import { LeftOutlined } from "@ant-design/icons";
import { useLocation, NavLink } from "react-router-dom";
import axios from "axios";
import loader from "../../Assets/img/loader.svg";
import plus from "../../Assets/img/plus.png";

const DataTable = () => {
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedData, setselectedData] = useState({
    Name: "",
    Type: "",
    TTL: 0,
    ResourceRecords: [],
  });
  const [data, setData] = useState([]);
  const [count, setCount] = useState(1);
  const [open, setOpen] = useState(false);
  const [addData, setAddData] = useState({
    Name: "",
    Type: "",
    TTL: 0,
    ResourceRecords: [],
  });
  const dns_records = [
    "A",
    "AAAA",
    "CNAME",
    "MX",
    "NS",
    "PTR",
    "SOA",
    "SRV",
    "TXT",
    "DNSSEC",
  ];

  const columns = [
    {
      title: "S.NO",
      dataIndex: "NO",
      key: "NO",
      sorter: (a, b) => a.NO - b.NO,
    },
    {
      title: "Domain Name",
      dataIndex: "Name",
      key: "Name",
      filters: data
        ?.filter(
          (value, index, self) =>
            self.findIndex((item) => item.Name === value.Name) === index
        )
        .map((item) => {
          const key = item.Name;
          return {
            text: key,
            value: key,
          };
        }),
      onFilter: (value, record) => record.Name === value,
    },
    {
      title: "Type",
      dataIndex: "Type",
      key: "Type",
      filters: dns_records.map((values) => ({ text: values, value: values })),
      onFilter: (value, record) => record.Type === value,
    },
    {
      title: "Value",
      dataIndex: "ResourceRecords",
      key: "ResourceRecords",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <button className="primary-btn" onClick={() => showModal(record)}>
            Edit
          </button>
        </Space>
      ),
    },
  ];

  const dataItems = data?.map((value, index) => ({
    NO: index + 1,
    Name: value.Name,
    Type: value.Type,
    ResourceRecords: value.ResourceRecords.map((value) => value.Value + "\r\n"),
    TTL: value.TTL,
  }));

  const fetchData = async (id) => {
    await axios.get(`http://localhost:8080/${id}`).then((res) => {
      setData(res.data);
    });
  };

  useEffect(() => {
    setLoading(true);
    fetchData(location.state);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const createRecord = async () => {
    if (
      addData.Name === "" ||
      addData.Type === "" ||
      addData.TTL === 0 ||
      addData.ResourceRecords.length === 0
    ) {
      return message.error("Please enter all the fields");
    } else {
      await axios
        .post("http://localhost:8080/createRecord", {
          addData,
          id: location.state,
        })
        .then((res) => {
          console.log(res);
          message.success("Record Created Successfully.");
          setOpen(false);
        })
        .catch((err) => {
          console.log(err);
          message.error("Failed to create record.");
        });
    }
  };

  const updateRecord = async () => {
    if (
      selectedData.Name === "" ||
      selectedData.Type === "" ||
      selectedData.TTL === 0 ||
      selectedData.ResourceRecords.length === 0
    ) {
      return message.error("Please enter all the fields");
    } else {
      await axios
        .post("http://localhost:8080/updateRecord", {
          selectedData,
          id: location.state,
        })
        .then((res) => {
          console.log(res);
          setIsModalOpen(false);
          message.success("Record Updated Successfully.");
        })
        .catch((err) => {
          console.log(err);
          message.error("Failed to update record.");
        });
    }
  };

  const deleteRecord = async (value) => {
    if (value?.Type === "NS" || value?.Type === "SOA") {
      return message.error("Cannot delete this type of record");
    } else {
      await axios
        .delete(`http://localhost:8080/deleteRecord`, {
          data: { value, id: location.state },
        })
        .then((res) => {
          console.log(res);
          setIsModalOpen(false);
          message.success("Record Deleted Successfully.");
        })
        .catch((err) => {
          console.log(err);
          message.error("Failed to delete record.");
        });
    }
  };

  const handleOnChange = (e) => {
    setselectedData({ ...selectedData, [e.target.name]: e.target.value });
  };
  const handleOnTypeChange = (value) => {
    setselectedData({ ...selectedData, Type: value });
  };
  const handleOnValueChange = (e, index) => {
    setselectedData((prevState) => {
      const updatedResourceRecords = [...prevState.ResourceRecords];
      updatedResourceRecords[index] = e.target.value;
      return { ...prevState, ResourceRecords: updatedResourceRecords };
    });
  };
  const handleOnAddChange = (e) => {
    setAddData({ ...addData, [e.target.name]: e.target.value });
  };
  const handleOnAddTypeChange = (value) => {
    setAddData({ ...addData, Type: value });
  };
  const handleOnAddResourceChange = (e, index) => {
    setAddData((prevState) => {
      const updatedResourceRecords = [...prevState.ResourceRecords];
      updatedResourceRecords[index] = { Value: e.target.value };
      return { ...prevState, ResourceRecords: updatedResourceRecords };
    });
  };

  const showDrawer = () => {
    if (localStorage.getItem("isLoggedIn")) {
      setOpen(true);
    } else {
      message.error("Please login to Add a Domain!");
    }
  };

  const showModal = (value) => {
    if (localStorage.getItem("isLoggedIn")) {
      setselectedData(value);
      setIsModalOpen(true);
    } else {
      message.error("Please login to Edit!");
    }
  };

  return (
    <div className="table">
      <Breadcrumb
        items={[
          {
            title: <NavLink to="/"><LeftOutlined /> Hosted Zones</NavLink>
          },
          {
            title: "Domains",
          },
        ]}
      />

      <Modal
        title="Edit Record"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Popconfirm
            title="Delete Record"
            description="Are you sure to delete this Record?"
            onConfirm={() => deleteRecord(selectedData)}
            okText="Yes"
            cancelText="No"
          >
            <button className="primary-btn danger">Delete</button>
          </Popconfirm>,

          <button className="primary-btn" onClick={updateRecord}>
            Update
          </button>,
        ]}
      >
        <div className="edit-form">
          <label>Domain Name</label>
          <input
            className="domain-ip"
            name="Name"
            type="text"
            value={selectedData?.Name}
            onChange={(e) => handleOnChange(e)}
          />
        </div>
        <div className="edit-form">
          <label>TTL (Seconds)</label>
          <input
            className="domain-ip"
            name="TTL"
            type="number"
            placeholder="300"
            value={selectedData?.TTL}
            onChange={(e) => handleOnAddChange(e)}
          />
        </div>
        <div className="edit-form">
          <label>Type</label>
          <Select
            defaultValue={selectedData?.Type}
            onChange={handleOnTypeChange}
            name="Type"
            options={dns_records.map((records) => ({
              value: records,
              label: records,
            }))}
          />
        </div>
        <div className="edit-form">
          <label className="add-label">
            Value
            <img
              src={plus}
              alt="add-icon"
              width={15}
              className="add-img"
              onClick={() => setCount(count + 1)}
            />
          </label>
          {selectedData?.ResourceRecords?.map((value, index) => (
            <input
              className="domain-ip"
              type="text"
              name="ResourceRecords"
              onChange={(e) => handleOnValueChange(e, index)}
              placeholder={value}
            />
          ))}
          {[...Array(count)].map((val, i) => (
            <input
              className="domain-ip"
              type="text"
              name="ResourceRecords"
              placeholder="Add Values"
              onChange={(e) =>
                handleOnValueChange(
                  e,
                  selectedData?.ResourceRecords?.length + i + 1
                )
              }
            />
          ))}
        </div>
      </Modal>
      <Drawer
        title="Create a Record"
        width={720}
        onClose={() => setOpen(false)}
        open={open}
        styles={{
          body: {
            paddingBottom: 80,
          },
        }}
        extra={
          <Space>
            <button
              className="primary-btn normal"
              onClick={() => setOpen(false)}
            >
              Cancel
            </button>
            <button className="primary-btn" onClick={createRecord}>
              Submit
            </button>
          </Space>
        }
      >
        <div className="edit-form">
          <label>Domain Name</label>
          <input
            className="domain-ip"
            name="Name"
            type="text"
            placeholder="Domain Name"
            onChange={(e) => handleOnAddChange(e)}
          />
        </div>
        <div className="edit-form">
          <label>TTL (Seconds)</label>
          <input
            className="domain-ip"
            name="TTL"
            type="number"
            placeholder="300"
            onChange={(e) => handleOnAddChange(e)}
          />
        </div>
        <div className="edit-form">
          <label>Type</label>
          <Select
            defaultValue="Type"
            onChange={handleOnAddTypeChange}
            name="Type"
            options={dns_records.map((records) => ({
              value: records,
              label: records,
            }))}
          />
        </div>
        <div className="edit-form">
          <label className="add-label">
            Value
            <img
              src={plus}
              alt="add-icon"
              width={15}
              className="add-img"
              onClick={() => setCount(count + 1)}
            />
          </label>
          {[...Array(count)].map((e, i) => (
            <input
              className="domain-ip"
              type="text"
              name="ResourceRecords"
              placeholder="Add values"
              onChange={(e) => handleOnAddResourceChange(e, i)}
            />
          ))}
        </div>
      </Drawer>
      <div className="table-header" style={{ marginBlock: "2vh" }}>
        <h1 style={{ color: "#009879", margin: 0 }}>Domains</h1>
        <button className="primary-btn" onClick={() => showDrawer()}>
          Add a Domain
        </button>
      </div>
      {loading ? (
        <div className="loader">
          <img src={loader} alt="" />
        </div>
      ) : (
        <Table columns={columns} dataSource={dataItems} />
      )}
    </div>
  );
};

export default DataTable;
