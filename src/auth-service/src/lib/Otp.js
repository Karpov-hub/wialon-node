async function check() {
  return { otp: 1 };
}
async function send() {
  return { otp: 2 };
}

export default {
  check,
  send
};
