const express = require("express");
const AWS = require("aws-sdk");
const cors = require("cors");
const multer = require('multer');
const { uuid } = require("uuidv4");
require("dotenv").config();
const app = express();
const storage = multer.memoryStorage();
const upload = multer({ dest: 'uploads/', storage: storage});

app.use(express.json());

app.use(
  cors({
    origin: ["http://localhost:3000", "https://dns-manager-one.vercel.app"],
    methods: ["GET", "POST", "DELETE", "PUT"],
    allowedHeaders: ["Content-Type", "Authorization", "scheme"],
  })
);

AWS.config.update({
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.REACT_APP_SECRET_ACCESS_KEY,
});
const route53 = new AWS.Route53();

app.post("/login", async (req, res) => {
  const { userid, password } = req.body.data;
  if (
    userid === process.env.REACT_APP_USERNAME &&
    password === process.env.REACT_APP_PASSWORD
  ) {
    res.status(200).send("Login successfull");
  } else {
    res.status(500).send("Login Failed");
  }
});

app.get("/getHostedZones", async (req, res) => {
  await route53
    .listHostedZones()
    .promise()
    .then((records) => {
      res.send(records);
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});

app.post("/createHostedZone", async (req, res) => {
  const { Name, PrivateZone, comment } = req.body.hostedZoneData;
  const params = {
    CallerReference: uuid(),
    Name: Name,
    HostedZoneConfig: {
      Comment: comment,
      PrivateZone: PrivateZone,
    },
  };

  await route53
    .createHostedZone(params)
    .promise()
    .then((records) => {
      res.send(records);
    })
    .catch((err) => {
      res.status(500).json(err);
    });
});

app.delete("/deleteHostedZone/:id", async (req, res) => {
  const id = req.params.id;
  console.log(id);
  route53
    .deleteHostedZone({ Id: id })
    .promise()
    .then((records) => {
      res.send("Hosted zone deleted successfully:");
    })
    .catch((err) => {
      res.send("Error deleting hosted zone: ", err);
    });
});

app.get("/:id", async (req, res) => {
  const id = req.params.id;
  async function getResourceRecordSets(id) {
    let nextRecordName = null;
    const allRecords = [];

    do {
      const request = {
        HostedZoneId: id,
        StartRecordName: nextRecordName,
      };

      const currentRecords = await route53
        .listResourceRecordSets(request)
        .promise();
      nextRecordName = currentRecords.NextRecordName;
      allRecords.push(...currentRecords.ResourceRecordSets);
    } while (nextRecordName);

    return allRecords;
  }
  getResourceRecordSets(id)
    .then((records) => {
      res.send(records);
    })
    .catch((err) => {
      res.send(err);
    });
});

app.post("/createRecord", async (req, res) => {
  const { Name, ResourceRecords, Type, TTL } = req.body.addData;
  const id = req.body.id;
  var params = {
    ChangeBatch: {
      Changes: [
        {
          Action: "CREATE",
          ResourceRecordSet: {
            Name: Name,
            Type: Type,
            TTL: TTL,
            ResourceRecords: ResourceRecords,
          },
        },
      ],
    },
    HostedZoneId: id,
  };

  await route53
    .changeResourceRecordSets(params)
    .promise()
    .then(() => {
      res.status(200).send("Successfully created Route 53 record");
    })
    .catch((err) => {
      res.status(500).send("Failed to create Route 53 record", err);
    });
});

app.post("/updateRecord", async (req, res) => {
  const { Name, ResourceRecords, Type, TTL } = req.body.selectedData;
  const id = req.body.id;
  const params = {
    ChangeBatch: {
      Changes: [
        {
          Action: "UPSERT",
          ResourceRecordSet: {
            Name: Name,
            Type: Type,
            TTL: TTL,
            ResourceRecords: ResourceRecords?.map((value) => ({
              Value: value,
            })),
          },
        },
      ],
    },
    HostedZoneId: id,
  };

  await route53
    .changeResourceRecordSets(params)
    .promise()
    .then(() => {
      res.send("Successfully updated Route 53 record");
    })
    .catch((err) => {
      res.status(500).send("Failed to update Route 53 record", err);
    });
});

app.delete("/deleteRecord", async (req, res) => {
  const { Name, ResourceRecords, Type, TTL } = req.body.value;
  const id = req.body.id;
  const params = {
    ChangeBatch: {
      Changes: [
        {
          Action: "DELETE",
          ResourceRecordSet: {
            Name: Name,
            Type: Type,
            TTL: TTL,
            ResourceRecords: ResourceRecords.map((value) => ({
              Value: value,
            })),
          },
        },
      ],
    },
    HostedZoneId: id,
  };
  await route53
    .changeResourceRecordSets(params)
    .promise()
    .then(() => {
      res.send("Successfully deleted a Route 53 record");
    })
    .catch((err) => {
      res.status(500).send("Failed to delete Route 53 record", err);
    });
});

app.post("/fileUpload/:id", upload.single("file"), (req, res) => {
  const id = req.params.id
  console.log(req.file)
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }
  const fileContent = req.file.buffer.toString();
  const dnsRecords = JSON.parse(fileContent);

  const params = {
    ChangeBatch: {
      Changes: dnsRecords.map((record) => ({
        Action: "CREATE",
        ResourceRecordSet: record,
      })),
      Comment: "Add DNS records",
    },
    HostedZoneId: id,
  };

  route53
    .changeResourceRecordSets(params)
    .promise()
    .then(() => {
      res.send("DNS records added successfully.");
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).send("Error adding DNS records.");
    });
});

app.listen(process.env.REACT_APP_PORT, () =>
  console.log(`Server running on port ${process.env.REACT_APP_PORT}`)
);
