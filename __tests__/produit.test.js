const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../app");

require("dotenv").config();

beforeAll(async() => {
    await mongoose.connect(process.env.MONGODB_URI_PROD);
});

/* Closing database connection after each test. */
afterAll(async() => {
    await mongoose.connection.close();
});

let _id = null;
let token = null

describe("POST /api/auth/login", () => {
    it("login with correct email and password", async() => {
        const payload = {
            email: 'dowesw@yahoo.fr',
            password: '0000'
        }
        const res = await request(app).post("/api/auth/login").send(payload);
        expect(res.statusCode).toBe(200);
        if (res.statusCode == 200) {
            token = res.body.token;
        }
    });
});

describe("POST /api/produits", () => {
    it("create a product", async() => {
        expect(token).not.toBeNull();
        const payload = {
            nom: '_Appareil_ photo',
            description: 'Appareil photo numerique haute definition',
            fabricant: 'Phillips',
            prix: 5000
        }
        const res = await request(app).post("/api/produits").send(payload).set({ Authorization: 'Bearer ' + token });
        expect(res.statusCode).toBe(200);
    });
});

describe("GET /api/produits", () => {
    it("return all products", async() => {
        expect(token).not.toBeNull();
        const res = await request(app).get("/api/produits").set({ Authorization: 'Bearer ' + token });
        expect(res.statusCode).toBe(200);
        if (res.statusCode == 200) {
            const product = res.body.find(x => x.nom == '_Appareil_ photo');
            _id = product ? product._id : null
        }
    });
});

describe("GET /api/produits/:id", () => {
    it("return one product form id", async() => {
        expect(_id).not.toBeNull();
        expect(token).not.toBeNull();
        const res = await request(app).get(`/api/produits/${_id}`).set({ Authorization: 'Bearer ' + token });
        expect(res.statusCode).toBe(200);
    });
});

describe("PATCH /api/produits/:id/like", () => {
    it("like a product by user", async() => {
        expect(_id).not.toBeNull();
        expect(token).not.toBeNull();
        const res = await request(app).patch(`/api/produits/${_id}/like`).set({ Authorization: 'Bearer ' + token });
        expect(res.statusCode).toBe(200);
    });
});

describe("DELETE /api/produits/:id", () => {
    it("delete one product form id", async() => {
        expect(_id).not.toBeNull();
        expect(token).not.toBeNull();
        const res = await request(app).delete(`/api/produits/${_id}`).set({ Authorization: 'Bearer ' + token });
        expect(res.statusCode).toBe(200);
    });
});