const dbc = require('../utils/dbconnect')
const db = dbc.getDB();
const check = require('../utils/helper')
//
//Create a comment
exports.createComment =(req,res,next) =>{
    let userId = req.userId
    let sql = "INSERT INTO comment (user_id,post_id,content,isActive) VALUES (?, ?, ?, 1)";
    let query = db.query(sql,[userId,req.params.post_id, req.body.content,],function (err, results,fields){
      if(err){
        throw err
      }
      res.status(200).json (results)
    })
  };
// Display all comments
exports.getAllComment =(req,res,next)=>{
    let postId = req.params.post_id;
    let sql = "SELECT c.id,c.content,c.date_creation,c.user_id,u.firstname, u.lastname, u.pseudo, u.avatar FROM comment c, users u, post p WHERE c.post_id = ? AND p.id = c.post_id AND c.user_id = u.id AND u.isActive=1 AND p.isActive=1 AND c.isActive=1 ORDER BY c.date_creation DESC";
    let query =db.query(sql,[postId],function(err, result){
        if(err){
          throw err
        }
        res.status(200).json (result)
      })
};

// display the comments of a specific user (the logged-in user)
exports.getAllUserComment =(req,res,next)=>{
    let userId = req.params.user_id;
    let sql = "SELECT c.content,c.date_creation ,u.firstname, u.lastname, u.avatar AS avatar, u.pseudo AS pseudo FROM comment c, users u WHERE c.user_id = u.id AND u.isActive=1 AND c.isActive=1  AND c.id = ? ";
    let query =db.query(sql, [userId],function(err, result){
        if(err){
          throw err
        }
        res.status(200).json (result)
      })
};

/* display one comment 

exports.getOneComment =(req,res,next)=>{
    let commentId = req.params.id;
    let sql ="SELECT * FROM comment c WHERE c.isActive=1 AND c.id =?";
    let query =db.query(sql,[commentId],function(err, result){
        if(err){
          throw err
        }
        res.status(200).json (result)
      })
}; */


//Count like

exports.countLike =(req,res,next)=>{
  let commentId = req.params.comment_id;
  let type = "c"
  let sql = "SELECT COUNT(comment_id) AS TOTAL FROM likes l where l.comment_id = ? and l.type= ? "
  let query =db.query(sql,[commentId,type],function (err, result){
    if(err){
    throw err
    }
    res.status(200).json ({message :"Le nombre de like sur ce commentaire est : "+ result[0].TOTAL})
  })
};


// Edit or deactivate a post if you are the user or the admin
exports.deleteOneComment = (req,res,next) => {

  check.userAllowedToEditComment(req.userId, req.params.id)
      .then(function(isAllowed) {
          db.query('UPDATE comment c SET c.isActive=0 where c.id=?', [req.params.id], function(err, result) {
            //db.query ('DELETE FROM comment c where p.id =?) pour le supprimer définitivement
              if (err) {
                  return res.status(500).json({error: err.message})
              }
              res.json({message: 'Commentaire désactivé.'});
          })
      })
      .catch(function(err) {
          res.status(500).json({message :"L'utilisateur n'est pas identifié comme propriétaire du comment , ni comme admin"})
      })
}

