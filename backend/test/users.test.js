const request = require("supertest");
const app = require("../src/app");

describe("Users endpoints", () => {
  it("post request to /api/users should create a user", async () => {
    const userToCreate = {
      name: `johnson${Math.random()}`,
      age: 27,
      email: `johnson@ymail.com${Math.random()}`,
      location: "berlin",
      bio: "Been There. Done That.",
    };

    const createdUser = (
      await request(app).post("/api/users").send(userToCreate)
    ).body;
    expect(createdUser.name).toBe(userToCreate.name);
    expect(createdUser.age).toBe(userToCreate.age);
    expect(createdUser.email).toBe(userToCreate.email);
    expect(createdUser.location).toBe(userToCreate.location);
    expect(createdUser.bio).toBe(userToCreate.bio);
  });

  it("get request to /api/users should list users", async () => {
    const userList = (await request(app).get("/api/users")).body;
    const usersExist = userList.length > 0;

    expect(usersExist).toBe(true);
  });

  it("user should be able to like a photo", async () => {
    // create a photo
    const photo = (
      await request(app)
        .post("/api/photos")
        .send({ photoName: "coyotivtestingsession.png" })
    ).body;
    console.log("-------------photo--", photo);

    // create a user
    const userWithPhoto = (
      await request(app)
        .post("/api/users")
        .send({
          name: `james${Math.random()}`,
          age: 27,
          email: `james@getMaxListeners.com${Math.random()}`,
          location: "dusseldorf",
          bio: "Someone sharing photos.",
        })
    ).body;
    console.log("-------------userWithPhoto--", userWithPhoto);

    // add the photo to that user//
    await request(app)
      .post(`/api/users/${userWithPhoto._id}/adds`)
      .send({ photoId: photo._id });

    // create another user
    const likerUser = {
      name: `jonas${Math.random()}`,
      age: 36,
      email: `johnas@ymail.com${Math.random()}`,
      location: "accra",
      bio: "Someone liking photos.",
    };

    const createdLikerUser = (
      await request(app).post("/api/users").send(likerUser)
    ).body;
    console.log("-------------createdLikerUser--", createdLikerUser);

    // like the photo with that another user
    await request(app)
      .post(`/api/users/${createdLikerUser._id}/likes`)
      .send({ photoId: photo._id });

    const finalPhotoUser = (
      await request(app).get(`/api/users/${userWithPhoto._id}/json`)
    ).body;
    console.log("-------------finalPhotoUser--", finalPhotoUser);

    const finalLikerUser = (
      await request(app).get(`/api/users/${createdLikerUser._id}/json`)
    ).body;
    console.log("-------------finalLikerUser--", finalLikerUser);

    expect(finalPhotoUser.photos.length).toBe(1);
    expect(finalLikerUser.likes.length).toBe(1);

    console.log(
      "finalPhotoUser.photos[0].likedBy[0]._id",
      finalPhotoUser.photos[0].likedBy[0]._id
    );

    expect(finalPhotoUser.photos[0].likedBy[0]._id).toBe(finalLikerUser._id);
    expect(finalLikerUser.likes[0]).toBe(finalPhotoUser.photos[0]._id);
  });
});
