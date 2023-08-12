const cors = require("cors");
const express = require("express");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const router = require("./router");
const http = require("http");
const dotenv = require("dotenv");

dotenv.config();

const uri = String(process.env.MONGO_URI);
const port = Number(process.env.PORT);
const socket_port = Number(process.env.SOCKET_PORT);
const connectOptions = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
};

const lincenseCache = {};

mongoose
  .connect(uri, connectOptions)
  .then()
  .catch((err) => console.log("Error:" + err));

mongoose.connection.once("open", () =>
  console.log("Connected to MongoDB successfully..."),
);

const app = express();
// const server = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let logStream = fs.createWriteStream(path.join(__dirname, "file.log"), {
  flags: "a",
});

// const net = require('net');

// const server = net.createServer(socket => {
//   try{
//     console.log('Camera connected.');

//     // Handle incoming data from the camera
//     socket.on('data', data => {
//       socket.write('Received data from camera.');
//       try{
//         // dont count get data
//         if(data.toString().includes('GET')){
//           return;
//         }
//         const requestData = JSON.parse(data.toString());
//         // const { cameraId, detected, numberPlate } = requestData;

//         console.log('Received data from camera:');
//         console.log('Camera ID:', requestData.cameraId);
//         console.log('Detected:', requestData.detected);
//         console.log('Number Plate:', requestData.numberPlate);

//         // handle

//         // TODO: create booking

//         const response = {
//           status: 'success',
//           message: 'Data received successfully.'
//         };
//         socket.write(JSON.stringify(response));
//       }
//       catch(err){
//         console.log(err);
//       }
//     });

//     socket.on('end', () => {
//       console.log('Camera disconnected.');
//     });

//     socket.on('error', err => {
//       console.error('Socket error:', err);
//     });
//   }
//   catch(err){
//     console.log(err);
//   }
// });

// const appSocket = require('http').createServer();
// const io = require('socket.io')(app);

// // Socket.io event handling
// io.on('connection', socket => {
//   console.log('Camera connected.');

//   // Handle incoming data from the camera
//   socket.on('cameraData', data => {
//     const { cameraId, detected, numberPlate } = data;

//     console.log('Received data from camera:');
//     console.log('Camera ID:', cameraId);
//     console.log('Detected:', detected);
//     console.log('Number Plate:', numberPlate);

//     // Here, you can process the data received from the camera and perform the necessary actions.
//     // For example, you can send the number plate data to the Parkify server for further processing.

//     // Respond to the camera
//     const response = {
//       status: 'success',
//       message: 'Data received successfully.'
//     };
//     socket.emit('response', response);
//   });

//   // Handle socket disconnection
//   socket.on('disconnect', () => {
//     console.log('Camera disconnected.');
//   });

//   // Handle socket errors
//   socket.on('error', err => {
//     console.error('Socket error:', err);
//   });
// });

// app.listen(port, () => {
//   console.log(`Socket server listening on port ${port}`);
// });

app.use(morgan("combined", { stream: logStream }));
app.use(morgan("combined"));

// SSE

// Store the connected clients
const clients = [];

// Send data to all connected clients
const sendData = (data) => {
  clients.forEach((res) => res.write(`data: ${JSON.stringify(data)}\n\n`));
};

const server = express();

// SSE endpoint
server.get("/sse", (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  // Add the client to the list
  clients.push(res);

  // sendData({
  //   cameraId: "1",
  //   detected: true,
  // });
  sendData({
    test: true,
  });

  // Remove the client from the list
  res.on("close", () => {
    clients.splice(clients.indexOf(res), 1);
  });
});

// #############################################
// #############################################
// #############################################
const bookingService = require("./services/booking.service");
const garageService = require("./services/garage.service");
const userService = require("./services/user.service");
const { messageCustom } = require("./utils/message");
const { OK, NOT_FOUND, BAD_REQUEST } = require("./utils/messageTypes");
const handleErrors = require("./utils/errorHandler");

app.post("/bookings/accept", async (req, res) => {
  try {
    // accept from client
    // only get cameraId, in/out, licenseId

    if (!req.body.cameraId || !req.body.type || !req.body.licenseId) {
      throw {
        statusObj: BAD_REQUEST,
        type: "ValidationError",
        name: "Missing fields",
      };
    }

    const camera = await garageService.findCamera({ _id: req.body.cameraId });
    if (!camera) {
      throw {
        statusObj: BAD_REQUEST,
        type: "ValidationError",
        name: "Camera Not Found",
      };
    }

    //find garage
    let garage = await garageService.findGarage({ _id: camera.garageId });
    if (garage.length == 0) {
      throw {
        statusObj: BAD_REQUEST,
        type: "ValidationError",
        name: "Garage Not Found",
      };
    }
    garage = garage[0];

    //find user by licenseId
    const user = await userService.getUser({ licenseId: req.body.licenseId });
    if (!user) {
      throw {
        statusObj: BAD_REQUEST,
        type: "ValidationError",
        name: "User Not Found",
      };
    }

    // if in
    if (req.body.type === "in") {
      //check if user has a booking
      let bookingalready = await bookingService.findBooking({
        userId: user._id,
        status: "inbooking",
      });
      if (bookingalready.length > 0) {
        throw {
          statusObj: BAD_REQUEST,
          type: "ValidationError",
          name: "User already has a booking",
        };
      }

      // find slot

      // garages.slot contains field: name, type, chargePerHour, status. find if status is available
      const slotSelected = garage.slots.find(
        (slot) => slot.status === "available",
      );
      if (!slotSelected) {
        throw {
          statusObj: BAD_REQUEST,
          type: "ValidationError",
          name: "No available slot",
        };
      }
      //select a slot
      const slotName = slotSelected.name;
      // update slot status to occupied
      garage.slots = garage.slots.map((slot) => {
        if (slot.name === slotName) {
          slot.status = "occupied";
        }
        return slot;
      });

      // update garage
      await garageService.updateGarage(garage._id, garage);

      // create booking
      const booking = await bookingService.newBooking({
        userId: user._id,
        garageId: garage._id,
        slotId: slotSelected._id,
        slotName: slotName,
        status: "inbooking",
        startTime: new Date(),
        licenseId: req.body.licenseId,
        chargePerHour: slotSelected.chargePerHour,
      });

      const return_object = {
        booking,
      };
      // INSERT SSE
      const dataToSend = {
        test: false,
        userId: user._id,
        booking: booking,
      };
      sendData(dataToSend);
      messageCustom(res, OK, "Booking created successfully", return_object);
      return;
    }
    // if out
    else {
      let booking = await bookingService.findBooking({
        userId: user._id,
        status: "inbooking",
      });

      if (booking.length == 0) {
        throw {
          statusObj: BAD_REQUEST,
          type: "ValidationError",
          name: "No booking found",
        };
      }

      // update slot in garage
      garage.slots = garage.slots.map((slot) => {
        if (slot.name === booking[0].slotName) {
          slot.status = "available";
        }
        return slot;
      });

      // update garage
      await garageService.updateGarage(garage._id, garage);

      // update booking
      booking = booking[0];
      booking.status = "checkedout";
      booking.endTime = new Date();
      booking.amount =
        ((booking.endTime - booking.startTime) * booking.chargePerHour) /
        3600000;

      await bookingService.updateBooking(booking._id, booking);

      const return_object = {
        booking,
      };

      const dataToSend = {
        test: false,
        userId: user._id,
        booking: booking,
      };
      sendData(dataToSend);

      messageCustom(res, OK, "Booking updated successfully", return_object);
    }

    // const booking = await bookingService.newBooking(req.body);

    // const return_object = {
    //   booking,
    // };

    // messageCustom(res, OK, "Booking created successfully", return_object);
  } catch (error) {
    handleErrors(req, res, error);
  }
});

// #############################################
// #############################################
// #############################################

// router
app.use(router);

app.listen(port, () =>
  console.log(`FindMyGarage Server running at http://localhost:${port}`),
);
// appSocket.listen(socket_port, () => console.log(`Parkify Socket server running at http://localhost:${socket_port}`));
server.listen(socket_port, () => {
  console.log(`Server is listening on port ${socket_port}`);
});
