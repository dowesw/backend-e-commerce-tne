const { v1: uuidv1, v4: uuidv4 } = require('uuid');
const crypto = require("crypto");

/**
 * Fonction qui permet de générer un id aléatoir
 * params : une liste id
 * return : un id qui n'est pas contenu dans la liste passée en paramètre
 */
exports.generatedId = (ids) => {
    const lenght = 12;
    let id = crypto.randomBytes(lenght).toString("hex");
    while (ids.includes(id)) {
        id = crypto.randomBytes(lenght).toString("hex");
    }
    return id;
}