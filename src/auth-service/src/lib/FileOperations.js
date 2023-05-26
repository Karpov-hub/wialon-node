import FileProvider from "@lib/fileprovider";

async function pushFile(data) {
  return await FileProvider.push(data, 300);
}
async function pullFile(code) {
  return await FileProvider.pull(code);
}
async function delFile(code) {
  return await FileProvider.del(code);
}
async function acceptFile(code) {
  return await FileProvider.accept(code);
}
async function statusFile(code) {
  return await FileProvider.status(code);
}
async function watermarkFile(code) {
  return await FileProvider.watermarkFile(code);
}

export default {
  pushFile,
  pullFile,
  delFile,
  acceptFile,
  statusFile,
  watermarkFile
};
