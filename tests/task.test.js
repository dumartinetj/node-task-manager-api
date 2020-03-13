const request = require("supertest");
const app = require("../src/app");
const Task = require("../src/models/task");
const {
  userOneId,
  userOne,
  userTwoId,
  userTwo,
  taskOne,
  taskTwo,
  taskThree,
  setupDb
} = require("./fixtures/db");

beforeEach(setupDb);

test("POST /tasks - Authenticated", async () => {
  const response = await request(app)
    .post("/tasks")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
      description: "Grab a beer"
    })
    .expect(201);

  const task = await Task.findById(response.body._id);
  expect(task).not.toBeNull();
  expect(task.description).toBe("Grab a beer");
  expect(task.completed).toEqual(false);
});

test("GET /tasks - Authenticated as UserOne", async () => {
  const response = await request(app)
    .get("/tasks")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .expect(200);

  expect(response.body.length).toBe(2);
});

test("GET /tasks?completed=true - Authenticated as UserOne", async () => {
  const response = await request(app)
    .get("/tasks?completed=true")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .expect(200);

  expect(response.body.length).toBe(1);
});

test("GET /tasks - Authenticated as UserTwo", async () => {
  const response = await request(app)
    .get("/tasks")
    .set("Authorization", `Bearer ${userTwo.tokens[0].token}`)
    .expect(200);

  expect(response.body.length).toBe(1);
});

test("DELETE /tasks/:taskOne - Authenticated as UserTwo (UNAUTHORIZED)", async () => {
  await request(app)
    .delete("/tasks/" + taskOne._id)
    .set("Authorization", `Bearer ${userTwo.tokens[0].token}`)
    .send()
    .expect(404);

  const task = Task.findById(taskOne._id);
  expect(task).not.toBeNull();
});
