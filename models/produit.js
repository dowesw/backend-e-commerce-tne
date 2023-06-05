const mongoose = require('mongoose');
const Commentaire = require('./commentaire');

const produitSchema = mongoose.Schema({
    nom: { type: String, required: true },
    description: { type: String, required: true },
    fabricant: { type: String, required: true },
    prix: { type: Number, default: 0 },
    image: { type: String, required: true },
    likes: { type: [String], required: true },
    commentaires: { type: [Commentaire], required: true },
    dateSave: { type: Date, default: mongoose.now() },
    dateUpdate: { type: Date, default: mongoose.now() }
});

module.exports = mongoose.model('Produit', produitSchema);