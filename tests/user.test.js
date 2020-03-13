const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/user");
const { userOne, userOneId, setupDb } = require("./fixtures/db");

beforeEach(setupDb);

test("POST /users - Valid", async () => {
  const response = await request(app)
    .post("/users")
    .send({
      firstname: "John",
      lastname: "Smith",
      email: "j.smith@foobar.io",
      password: "foobar1234"
    })
    .expect(201);

  const user = await User.findById(response.body.user._id);
  expect(user).not.toBeNull();

  expect(response.body).toMatchObject({
    user: {
      firstname: "John",
      lastname: "Smith",
      email: "j.smith@foobar.io"
    },
    token: user.tokens[0].token
  });

  expect(user.password).not.toBe("foobar1234");
});

test("POST /users - Invalid / Email used", async () => {
  const response = await request(app)
    .post("/users")
    .send({
      firstname: "Test",
      lastname: "Duplicate",
      email: "m.jenkins@foobar.io",
      password: "foobar1234"
    })
    .expect(400);
});

test("POST /users/login - Valid", async () => {
  const response = await request(app)
    .post("/users/login")
    .send({
      email: userOne.email,
      password: userOne.password
    })
    .expect(200);

  const user = await User.findById(userOneId);
  expect(response.body.token).toBe(user.tokens[1].token);
});

test("POST /users/login - Invalid / Bad credentials", async () => {
  await request(app)
    .post("/users/login")
    .send({
      email: userOne.email,
      password: "wrongpass"
    })
    .expect(400);
});

test("GET /users/me - Authorized", async () => {
  await request(app)
    .get("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
});

test("GET /users/me - Unauthorized", async () => {
  await request(app)
    .get("/users/me")
    .send()
    .expect(401);
});

test("DELETE /users/me - Authorized", async () => {
  await request(app)
    .delete("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  const user = await User.findById(userOneId);
  expect(user).toBeNull();
});

test("DELETE /users/me - Unauthorized", async () => {
  await request(app)
    .delete("/users/me")
    .send()
    .expect(401);
});

test("POST /users/me/avatar - Valid", async () => {
  await request(app)
    .post("/users/me/avatar")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .attach("avatar", "tests/fixtures/avatar.png")
    .expect(200);

  const user = await User.findById(userOneId);
  expect(user.avatar).toEqual(expect.any(Buffer));
});

test("POST /users/me/avatar - Invalid / Too big", async () => {
  await request(app)
    .post("/users/me/avatar")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .attach("avatar", "tests/fixtures/7mb.jpg")
    .expect(400);
});

test("POST /users/me/avatar - Invalid / Wrong format", async () => {
  await request(app)
    .post("/users/me/avatar")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .attach("avatar", "tests/fixtures/test.pdf")
    .expect(400);
});

test("PATCH /users/me - Valid", async () => {
  await request(app)
    .patch("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
      firstname: "Jim"
    })
    .expect(200);
  const user = await User.findById(userOne);
  expect(user.firstname).toBe("Jim");
});

test("PATCH /users/me - Invalid", async () => {
  await request(app)
    .patch("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
      _id: "toto"
    })
    .expect(400);
});
