/*
 * All routes for Widgets are defined here
 * Since this file is loaded in server.js into api/widgets,
 *   these routes are mounted onto /widgets
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 */
const { getUserByEmail, authenticateUser, mapsForUser, isLoggedIn } = require("./helpers.js");

const express = require('express');
const router = express.Router();
const generateHelpers = require('./helpers');

module.exports = (db) => {
  router.get("/somethings", (req, res) => {
    let query = `SELECT * FROM widgets`;
    console.log(query);
    db.query(query)
      .then(data => {
        const widgets = data.rows;
        res.json({ widgets });
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });

  //displays a list of links to maps (with names) associated with the category chosen
  router.get("/categories/:category", (req, res) => {
    const category = req.params.category;
    let query = `SELECT * FROM maps
    WHERE category = $1`;
    db.query(query, [category])
      .then(data => {
        let templateVars = {
          category,
          maps: data.rows,
          userId: req.session.userId
        }
        //pass the category chosen to the view file
        res.render("category", templateVars)
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });

  });

  //renders a form for creating a new map upon clicking "create new map"
  router.get("/maps/new", (req, res) => {
    const userId = req.session.userId;
    if (!isLoggedIn(req.session)) {
      res.status(403).send("Please login or register first.");
    } else {

      let templateVars = {
        userId: req.session.userId
      }

      res.render("new_map", templateVars);
    }
  });

  //displays the chosen map
  router.get("/maps/:id", (req, res) => {
    const id = req.params.id;
    let query = `SELECT maps.name AS name, maps.category,maps.owner_id, maps.id AS map_id, points.latitude, points.longitude, points.description, points.name AS points_name FROM maps
    JOIN pointsmaps ON maps.id = pointsmaps.map_id
    JOIN points ON points.id = pointsmaps.point_id
    WHERE maps.id = $1`;
    db.query(query, [id])
      .then(data => {
        let templateVars = {
          maps: data.rows,
          userId: req.session.userId
        }
        //pass the category chosen to the view file
        res.render("display_map", templateVars)
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });

  router.get("/maps/:id/markers", (req, res) => {
    const id = req.params.id;
    let query = `SELECT maps.name AS name, maps.category,maps.owner_id, maps.id AS map_id, points.latitude, points.longitude, points.description, points.name AS points_name FROM maps
    JOIN pointsmaps ON maps.id = pointsmaps.map_id
    JOIN points ON points.id = pointsmaps.point_id
    WHERE maps.id = $1`;
    db.query(query, [id])
      .then(data => {
        let templateVars = {
          maps: data.rows,
          userId: req.session.userId
        }
        //pass the category chosen to the view file
        res.json(templateVars);
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });

  //saves the map as favourite NEED DATABASE!!
  router.post("/maps/:id/favourites/", (req, res) => {
    const mapId = req.params.id;
    const userId = req.session.userId;
    const mapOwnerId = getOwnerId(req.session.userId);

    if (!isLoggedIn(req.session)) {
      res.status(403).send("Please login or register first.");
    } else {
      let query = `INSERT INTO favouritemaps VALUES ($1,$2)`;
      db.query(query, [mapId, mapOwnerId])

    }
  });

  //shows saved maps by the user
  router.get("/profile/maps", (req, res) => {
    const userId = req.session.userId;
    if (!isLoggedIn(req.session)) {
      res.status(403).send("Please login or register first.");
    } else {
      let query = `SELECT maps.id, maps.name, maps.category FROM maps JOIN users ON owner_id = users.id
    WHERE users.email = $1`;
      db.query(query, [userId])
        .then(data => {
          let templateVars = {
            maps: data.rows,
            userId: req.session.userId
          }
          //pass the category chosen to the view file
          res.render("my_maps", templateVars)
        })
        .catch(err => {
          res
            .status(500)
            .json({ error: err.message });
        });

    }
  });

  //editing maps =>to be figured out
  router.put("/maps/:id", (req, res) => {
    const newMap = req.body.newMap
    //intigrate new map info into database
    res.redirect("/profile/maps");
  });

  //posting new maps to database and redirecting to newly created map NOT COMPLETE
  router.post("/maps/", (req, res) => {
    //add the new map associated with the user to the database
    const mapName = req.body.map_name;
    const mapDescription = req.body.map_description;
    const mapCategory = req.body.map_category;
    const mapOwnerId = getOwnerId(req.session.userId);
    const pointName = req.body.point_name;
    const pointDescription = req.body.point_description;
    const pointLat = req.body.point_latitude;
    const pointLong = req.body.point_long;
    // function geocodeAddress(geocoder, resultsMap) {
    //   var address = document.getElementById('address').value;
    //   geocoder.geocode({'address': address}, function(results, status) {
    //     if (status === 'OK') {
    //       const r = Maps.
    //     } else {
    //       alert('Geocode was not successful for the following reason: ' + status);
    //     }
    //   });
    if (mapName) {
      let query = `
  // INSERT INTO maps VALUES ($1, $2, $3, $4)
  // RETURNING *;`;
      db.query(query, [mapName, mapDescription, mapCategory, mapOwnerId])
        .then(res => {
          console.log(res.rows);
        })
        .catch(err => {
          res
            .status(500)
            .json({ error: err.message });
        });
    }
    if (pointName) {
      let query2 = `
        INSERT INTO points VALUES ($1, $2, $3, $4) RETURNING *;`
      db.query(query2, [pointName, pointDescription, pointLat, pointLong])
      .then(res => {
        let resp
        resp.geometry.location.lat
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
    }
  });




  //deleting maps => to be figured out
  router.post("/maps/:id/", (req, res) => {
    //delete map from data base
    id = req.params.id;
    const userId = req.session.userId;
    if (!isLoggedIn(req.session)) {
      res.status(403).send("Please login or register first.");
    } else {
      let query = `DELETE FROM maps
      WHERE id = $1`;
      db.query(query, [id])
        .then(data => {
          let templateVars = {
            maps: data.rows,
            userId: req.session.userId
          }
          res.render("my_maps", templateVars)
        })
        .catch(err => {
          res
            .status(500)
            .json({ error: err.message });
        });

    }
  });

  const getOwnerId = function (email) {
    const query = `SELECT id FROM users
  WHERE email =$1;`
    db.query(query, [email])
      .then(data => {
        console.log(data.rows);
        return data.rows;

      })
  }

  return router;
};

