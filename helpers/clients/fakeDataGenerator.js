function generateFakePan() {
  const timestamp = Date.now().toString();
  const pan =
    timestamp.substr(timestamp.length - 10) + Math.floor(Math.random() * 1000);
  return pan;
}
function generateFakeNumber() {
  const timestamp = Date.now().toString();
  const pan = timestamp.substr(timestamp.length - 10);
  return pan;
}
function generateFakeEmail(username) {
  const timestamp = Date.now().toString();
  const email =
    username.split(" ").join("") +
    timestamp.substr(timestamp.length - 10) +
    "@email.com";
  return email;
}
export { generateFakeNumber, generateFakePan, generateFakeEmail };
