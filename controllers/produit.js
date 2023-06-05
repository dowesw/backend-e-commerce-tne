const fs = require('fs');
const mongoose = require('mongoose');
const Produit = require('../models/produit');

const Controle = (req, res, next) => {
    if (!req.body.nom) {
        res.status(400).json({ message: 'Vous devez préciser le nom du produit' })
        return false;
    }
    if (!req.body.description) {
        res.status(400).json({ message: 'Vous devez préciser la description du produit' })
        return false;
    }
    if (!req.body.fabricant) {
        res.status(400).json({ message: 'Vous devez préciser le fabricant du produit' })
        return false;
    }
    if (!req.body.prix) {
        res.status(400).json({ message: 'Vous devez préciser le prix du produit' })
        return false;
    }
    return true;
}

exports.findAll = (req, res, next) => {
    Produit.find().sort({ nom: -1 })
        .then((result) => { res.status(200).json(result); })
        .catch((error) => res.status(400).json({ message: error }));
};

exports.findOne = (req, res, next) => {
    Produit.findOne({ _id: req.params.id })
        .then((result) => {
            if (!result) {
                return res.status(400).json({ message: 'Produit non trouvé !' });
            }
            res.status(200).json(result);
        }).catch((error) => { res.status(404).json({ message: error }); });
};

exports.create = (req, res, next) => {
    if (!Controle(req, res, next)) {
        return;
    }
    const file = req.file ? req.file : (req.files ? req.files.length > 0 ? req.files[0] : null : null);
    const filename = file ? file.filename : 'produit.png'
    const produit = new Produit({
        ...JSON.parse(JSON.stringify(req.body)),
        image: `${req.protocol}://${req.get('host')}/images/${filename}`,
        likes: [],
        commentaires: []
    });
    produit.save()
        .then(() => res.status(201).json({ message: 'Produit enregistré !' }))
        .catch(error => res.status(400).json({ message: error }));
};

exports.update = (req, res, next) => {
    if (Controle(req, res, next)) {
        Produit.findOne({ _id: req.params.id })
            .then(result => {
                if (!result) {
                    return res.status(400).json({ message: 'Produit non trouvé !' });
                }
                const file = req.file ? req.file : (req.files ? req.files.length > 0 ? req.files[0] : null : null);
                let filename = file ? file.filename : 'produit.png'
                const objet = {
                    ...req.body,
                    likes: result.likes,
                    commentaires: result.commentaires,
                    dateUpdate: mongoose.now(),
                    image: `${req.protocol}://${req.get('host')}/images/${filename}`
                };
                filename = result.image.split('/images/')[1];
                if (((file ? file != null : false) && (filename !== 'produit.png')) || (filename !== 'produit.png')) {
                    fs.unlink(`images/${filename}`, () => {})
                }
                delete objet._id;
                Produit.updateOne({ _id: req.params.id }, {...objet, _id: req.params.id })
                    .then((r) => res.status(200).json({ message: 'Produit modifié !' }))
                    .catch(error => res.status(400).json({ message: error }));
            })
            .catch(error => res.status(400).json({ message: error }));
    }
};

exports.delete = (req, res, next) => {
    Produit.findOne({ _id: req.params.id })
        .then(result => {
            if (!result) {
                return res.status(400).json({ message: 'Produit non trouvé !' });
            }
            const filename = result.image.split('/images/')[1];
            if (filename !== 'produit.png') {
                fs.unlink(`images/${filename}`, () => {})
            }
            Produit.deleteOne({ _id: req.params.id })
                .then(() => res.status(200).json({ message: 'Produit supprimé !' }))
                .catch(error => res.status(400).json({ message: error }));
        })
        .catch(error => res.status(500).json({ error }));
};

// Aimer ou pas une sauce
exports.likeOrNot = (req, res, next) => {
    Produit.findOne({ _id: req.params.id })
        .then(result => {
            if (!result) {
                return res.status(400).json({ message: 'Produit non trouvé !' });
            }
            if (result.likes.includes(req.auth.userId)) {
                Produit.updateOne({ _id: req.params.id }, { $pull: { likes: req.auth.userId } })
                    .then((sauce) => { res.status(200).json({ message: 'Produit disliké !' }) })
                    .catch(error => res.status(400).json({ message: error }))
            } else {
                Produit.updateOne({ _id: req.params.id }, { $push: { likes: req.auth.userId } })
                    .then((sauce) => { res.status(200).json({ message: 'Produit liké !' }) })
                    .catch(error => res.status(400).json({ message: error }))
            }
        })
        .catch(error => res.status(400).json({ error }))
}