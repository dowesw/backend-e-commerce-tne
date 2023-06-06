const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../app");

require("dotenv").config();

beforeAll(async() => {
    await mongoose.connect(process.env.MONGODB_URI_PROD);
});


afterAll(async() => {
    await mongoose.connection.close();
});

describe("POST /api/auth/login", () => {
    it("login with wrong email and password", async() => {
        const payload = {
            email: 'dowesw@gmail.fr',
            password: '0000'
        }
        const res = await request(app).post("/api/auth/login").send(payload);
        expect(res.statusCode).toBe(400);
    });
});

describe("TEST signup, login, findOne, update and delete", () => {
    let _id = null;
    let token = null;
    it("signup with email, name and password", async() => {
        const payload = {
            email: 'dowesw@lymytz.fr',
            nom: 'Dowes Mbella',
            password: '0000'
        }
        const res = await request(app).post("/api/auth/signup").send(payload);
        expect(res.statusCode).toBe(200);
    });
    it("login with email and password", async() => {
        const payload = {
            email: 'dowesw@lymytz.fr',
            password: '0000'
        }
        const res = await request(app).post("/api/auth/login").send(payload);
        expect(res.statusCode).toBe(200);
        if (res.statusCode == 200) {
            _id = res.body.user._id;
            token = res.body.token;
        }
    });
    it("should return user", async() => {
        expect(token).not.toBeNull();
        const res = await request(app).get("/api/users").set({ Authorization: 'Bearer ' + token })
        expect(res.statusCode).toBe(200);
    });
    it("update user with id and token", async() => {
        expect(_id).not.toBeNull();
        const payload = {
            email: 'dowesw@lymytz.fr',
            nom: 'Dowes Guillaume Mbella',
            password: '0000'
        }
        const res = await request(app).put(`/api/users/${_id}`).send(payload).set({ Authorization: 'Bearer ' + token });
        expect(res.statusCode).toBe(200);
    });
    it("delete user with id and token", async() => {
        expect(_id).not.toBeNull();
        const res = await request(app).delete(`/api/users/${_id}`).set({ Authorization: 'Bearer ' + token });
        expect(res.statusCode).toBe(200);
    });
});