const dbc = require('../utils/dbconnect');
const bcrypt = require ('bcrypt');
const jwt = require('jsonwebtoken')
const db = dbc.getDB();


exports.signup = async (req, res) => {
  try {
    const { password } = req.body; //je crée une variable password à partir de la clé password
    const salt = await bcrypt.genSalt(10); //je declare un salage
    const hashPassword = await bcrypt.hash(password, salt); //je génére le hash avec salage sur le passowrd

    const user = {
      ...req.body,
      password: hashPassword,
    }; 
    //Je crée un object user qui lit le body et remplace la valeur de ma clé password par la valeur hash
    
    const sql = "INSERT INTO users SET ?";  // Je lui demande de créer l'user à partir de valeur inconnues
  
    db.query(sql, [user], function(err, result,fields){ // je passe mon user en second argument pour que ma requete recoivent les bonnes valeurs
      if (!result) { //vu que la contraintre d'unicité de l'email ancrée dans ma table , il n'y aura un result que si l'email n'est pas déja dans la base /sinon l'utilisateur est considéré comme enregistrée
        res.status(200).json({ message: "Email déjà enregistré" });
      } else {
        res.status(201).json({ message: "Utilisateur crée !" });
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Erreur d'enregistrement", err });
  }
};

//login
exports.login = (req, res,next) => {
  let email = req.body.email;
  const sql = "SELECT * FROM users u WHERE u.email = ?";
  db.query(sql, [email], (err, result) => { 
    // je passe mon email en second argument pour que ma requete recoivent les bonnes valeurs
    if (!result){
      return res.status(401).json({ error: 'Utilisateur non trouvé !' }); // if not existing user
    } 
    const user = result[0];
    bcrypt.compare(req.body.password,user.password)
      .then(valid => {
        if (!valid){
          return res.status(401).json ({message : 'mot de passe inconnu'})
        }
        console.log(res)
        res.status(200).json ({ //sinon j'envoie le token et l'utserid
          userId: user.id,
          token :jwt.sign(
            {userId: user.id},
            'RANDOM_TOKEN_SECRET',
            {expiresIn:'24h'})
          });
        })
      .catch(error => res.status(500).json({ error }));
    })
  } 


