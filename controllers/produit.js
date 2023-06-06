const fs = require('fs');
const mongoose = require('mongoose');
const Produit = require('../models/produit');
const Utils = require('../tools/utils')

/**
 * Fonction qui permet de vérifier l''existence des données
 * params : les attributs d'un produit dans le body
 * return : une valeur qui indique si on continue le execution ou non
 */
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

/**
 * Fonction qui permet de retourner tous les produits
 * params : le token dans le header (authorization)
 * return : la reponse qui contient la liste des produits
 */
exports.findAll = (req, res, next) => {
    Produit.find().sort({ nom: -1 })
        .then((result) => { res.status(200).json(result); })
        .catch((error) => res.status(400).json({ message: error }));
};

/**
 * Fonction qui permet de retourner les informations d'un produit
 * params : le token dans le header (authorization) et l'id de l'utilisateur sur l'url
 * return : la reponse qui contient les données du produit
 */
exports.findOne = (req, res, next) => {
    Produit.findOne({ _id: req.params.id })
        .then((result) => {
            if (!result) {
                return res.status(400).json({ message: 'Produit non trouvé !' });
            }
            res.status(200).json(result);
        }).catch((error) => { res.status(400).json({ message: error }); });
};

/**
 * Fonction qui permet de créer un produit
 * params : le token dans le header (authorization) et les données dans le body
 * return : la reponse qui contient un message
 */
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
        .then(() => res.status(200).json({ message: 'Produit enregistré !' }))
        .catch(error => res.status(400).json({ message: error }));
};

/**
 * Fonction qui permet de modifier un produit
 * params : le token dans le header (authorization), l'id de l'utilisateur sur l'url et les données dans le body
 * return : la reponse qui contient un message
 */
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
                    fs.unlink(`images/${filename}`, () => { })
                }
                delete objet._id;
                Produit.updateOne({ _id: req.params.id }, { ...objet, _id: req.params.id })
                    .then((r) => res.status(200).json({ message: 'Produit modifié !' }))
                    .catch(error => res.status(400).json({ message: error }));
            })
            .catch(error => res.status(400).json({ message: error }));
    }
};

/**
 * Fonction qui permet de supprimer un produit
 * params : le token dans le header (authorization) et l'id de l'utilisateur sur l'url
 * return : la reponse qui contient un message
 */
exports.delete = (req, res, next) => {
    Produit.findOne({ _id: req.params.id })
        .then(result => {
            if (!result) {
                return res.status(400).json({ message: 'Produit non trouvé !' });
            }
            const filename = result.image.split('/images/')[1];
            if (filename !== 'produit.png') {
                fs.unlink(`images/${filename}`, () => { })
            }
            Produit.deleteOne({ _id: req.params.id })
                .then(() => res.status(200).json({ message: 'Produit supprimé !' }))
                .catch(error => res.status(400).json({ message: error }));
        })
        .catch(error => res.status(500).json({ error }));
};

/**
 * Fonction qui permet d'aimer ou non un produit
 * params : le token dans le header (authorization) et l'id de l'utilisateur sur l'url
 * return : la reponse qui contient un message
 */
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

/**
 * Fonction qui permet d'ajouter / modifier / supprimer un commentaire dans un produit
 * params : le token dans le header (authorization), l'id de l'utilisateur sur l'url et les données dans le body
 * return : la reponse qui contient un message
 */
exports.commented = (req, res, next) => {
    Produit.findOne({ _id: req.params.id })
        .then(result => {
            if (!result) {
                return res.status(400).json({ message: 'Produit non trouvé !' });
            }
            let action = 'ajouté';
            if (req.body?.delete) {
                const index = result.commentaires.findIndex(x => x._id === req.body._id);
                if (index > -1) {
                    result.commentaires.splice(index, 1);
                }
                action = 'supprimé';
            } else {
                if (!req.body.commentaire) {
                    res.status(400).json({ message: 'Vous devez préciser un commentaire' })
                    return false;
                }
                const index = result.commentaires.findIndex(x => x._id === req.body?._id);
                let objet = null;
                if (index > -1) {
                    result.commentaires.splice(index, 1);
                    objet = {
                        _id: req.body._id,
                        dateUpdate: mongoose.now()
                    }
                    action = 'modifié';
                } else {
                    const _id = Utils.generatedId(result.commentaires.map(x => x._id));
                    objet = {
                        _id,
                        dateSave: mongoose.now(),
                        dateUpdate: mongoose.now()
                    }
                    action = 'ajouté';
                }
                objet = {
                    ...objet,
                    userId: req.auth.userId,
                    commentaire: req.body.commentaire
                }
                result.commentaires.push(objet);
            }
            Produit.updateOne({ _id: req.params.id }, { commentaires: result.commentaires })
                .then((sauce) => { res.status(200).json({ message: 'Commentaire du produit ' + action + '!' }) })
                .catch(error => res.status(400).json({ message: error }))
        })
        .catch(error => res.status(400).json({ error }))
}