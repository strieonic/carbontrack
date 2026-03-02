// Anonymous device identification – no login required
let deviceID = localStorage.getItem("ct_device_id");

if (!deviceID) {
  deviceID = crypto.randomUUID();
  localStorage.setItem("ct_device_id", deviceID);
}

export default deviceID;