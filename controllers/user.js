const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');

require('dotenv').config();

const User = require('../models/user');

const Controle = (req, res, next) => {
    if (!req.body.email) {
        res.status(400).json({ message: 'Vous devez préciser votre email' })
        return false;
    }
    if (!req.body.nom) {
        res.status(400).json({ message: 'Vous devez préciser votre nom' })
        return false;
    }
    return true;
}

exports.findOne = (req, res, next) => {
    User.findOne({ _id: req.auth.userId })
        .then(user => {
            if (!user) {
                return res.status(400).json({ message: 'Utilisateur non trouvé !' });
            }
            res.status(200).json({ user });
        })
        .catch(error => res.status(500).json({ message: error }));
};

exports.login = (req, res, next) => {
    User.findOne({ email: req.body.email })
        .then(user => {
            if (!user) {
                return res.status(400).json({ message: 'Utilisateur non trouvé !' });
            }
            if (!user.active) {
                return res.status(403).json({ message: 'Utilisateur désactivé !' });
            }
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid) {
                        return res.status(400).json({ message: 'Mot de passe incorrect !' });
                    }
                    res.status(200).json({
                        token: jwt.sign({ userId: user._id, admin: user.admin },
                            process.env.JWT_SECRET_KEY, { expiresIn: '24h' }
                        ),
                        user
                    });
                })
                .catch(error => res.status(500).json({ message: error }));
        })
        .catch(error => res.status(500).json({ message: error }));
};

exports.create = (req, res, next) => {
    if (!Controle(req, res, next)) {
        return;
    }
    if (!req.body.password) {
        return res.status(400).json({ error: 'Vous devez préciser votre mot de passe' })
    }
    bcrypt.hash(req.body.password, 10)
        .then(hash => {
            const file = req.file ? req.file : (req.files ? req.files.length > 0 ? req.files[0] : null : null);
            const filename = file ? file.filename : 'user.png'
            const user = new User({
                email: req.body.email,
                nom: req.body.nom,
                password: hash,
                photo: `${req.protocol}://${req.get('host')}/images/${filename}`
            });
            user.save()
                .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
                .catch(error => res.status(400).json({ message: error }));
        })
        .catch(error => res.status(500).json({ message: error }));
};

exports.update = (req, res, next) => {
    if (Controle(req, res, next)) {
        if (!req.auth.admin ? req.auth.userId !== req.params.id : false) {
            return res.status(400).json({ message: 'Invalid user ID!' });
        }
        User.findOne({ _id: req.params.id })
            .then(result => {
                if (!result) {
                    return res.status(400).json({ message: 'Utilisateur non trouvé !' });
                }
                const file = req.file ? req.file : (req.files ? req.files.length > 0 ? req.files[0] : null : null);
                let filename = file ? file.filename : 'user.png'
                const objet = User({
                    ...result,
                    email: req.body.email,
                    nom: req.body.nom,
                    photo: `${req.protocol}://${req.get('host')}/images/${filename}`
                });
                filename = result.photo.split('/images/')[1];
                if (((file ? file != null : false) && (filename !== 'user.png')) || (filename !== 'user.png')) {
                    fs.unlink(`images/${filename}`, () => {})
                }
                delete objet._id;
                User.updateOne({ _id: req.params.id }, {...JSON.parse(JSON.stringify(objet)), _id: req.params.id })
                    .then((r) => res.status(200).json({ message: 'Utilisateur modifié !' }))
                    .catch(error => res.status(400).json({ message: error }));
            })
            .catch(error => res.status(400).json({ message: error }));
    }
};

exports.delete = (req, res, next) => {
    if (!req.auth.admin ? req.auth.userId !== req.params.id : false) {
        return res.status(400).json({ message: 'Invalid user ID!' });
    }
    User.findOne({ _id: req.params.id })
        .then(result => {
            if (!result) {
                return res.status(400).json({ message: 'Utilisateur non trouvé !' });
            }
            const filename = result.photo.split('/images/')[1];
            if (filename !== 'user.png') {
                fs.unlink(`images/${filename}`, () => {})
            }
            User.deleteOne({ _id: req.params.id })
                .then(() => res.status(200).json({ message: 'Utilisateur supprimé !' }))
                .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(400).json({ message: error }));
};

exports.repassword = (req, res, next) => {
    if (!req.body.password) {
        return res.status(400).json({ message: 'Vous devez préciser votre mot de passe' })
    }
    if (!req.auth.admin ? req.auth.userId !== req.params.id : false) {
        return res.status(400).json({ message: 'Invalid user ID!' });
    }
    User.findOne({ _id: req.params.id })
        .then(result => {
            if (!result) {
                return res.status(400).json({ message: 'Utilisateur non trouvé !' });
            }
            bcrypt.hash(req.body.password, 10)
                .then(hash => {
                    User.updateOne({ _id: req.params.id }, { password: hash })
                        .then((r) => res.status(200).json({ message: `Mot de passe modifié !` }))
                        .catch(error => res.status(400).json({ message: error }));
                })
                .catch(error => res.status(500).json({ message: error }));
        })
        .catch(error => res.status(400).json({ message: error }));
};

exports.status = (req, res, next) => {
    if (!req.auth.admin ? req.auth.userId !== req.params.id : false) {
        return res.status(400).json({ message: 'Invalid user ID!' });
    }
    User.findOne({ _id: req.params.id })
        .then(result => {
            if (!result) {
                return res.status(400).json({ message: 'Utilisateur non trouvé !' });
            }
            User.updateOne({ _id: req.params.id }, { active: !result.active })
                .then((r) => res.status(200).json({ message: `Utilisateur ${result.active?'désactivé':'activé'} !` }))
                .catch(error => res.status(400).json({ message: error }));
        })
        .catch(error => res.status(400).json({ message: error }));
};