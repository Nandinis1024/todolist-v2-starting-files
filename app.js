//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash");
const mongoose = require("mongoose");
const port = 3000;
const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect('mongodb://127.0.0.1:27017/toDoListDB', {useNewUrlParser: true});

const itemsSchema = new mongoose.Schema({
  name: String,

});
const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item ({
  name: "Hey Welcome! Lets' get started",
});

const item2 = new Item ({
  name: "Click on the + to add a new item",
});

const defaultItems = [item1, item2];

async function addDefaultItems() {
  try {
    await Item.insertMany(defaultItems);
    console.log("Default items added to the DB");
  } catch (err) {
    console.log(err);
  }
}

// addDefaultItems();





app.get("/", async function(req, res) {
 
  let foundItems = await Item.find({});
  // console.log(typeof(foundItems));
  if (foundItems.length == 0) {
    addDefaultItems();
    res.redirect("/") 
  } 
  res.render("list", {listTitle: "Today", newListItems: foundItems});

});

app.post("/", async function(req, res){

  const itemName = req.body.newItem;
  let listHeading = req.body.list;

  const new_item = new Item ({
    name: itemName
  });

  if (listHeading == 'Today') {
    new_item.save();
    res.redirect("/");
    
  }else {
    let existingList = await List.findOne({name: listHeading});
    existingList.items.push(new_item);
    existingList.save();
    res.redirect("/"+listHeading);
  }
});

app.post("/delete", async function(req, res){
  let delItem = req.body.checkbox;
  let hid = req.body.hid;

  if (hid == "Today") {
    await Item.findByIdAndRemove(delItem);
    res.redirect("/");
    
  } else {
    await List.findOneAndUpdate({name: hid}, { $pull: { items: {_id: delItem}}});
    res.redirect("/"+hid);
  }

})

const listsSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]

});
const List = mongoose.model("List", listsSchema);



app.get("/:customList", async function(req,res){
  let customList = _.capitalize(req.params.customList);
  let foundList = await List.findOne({name: customList});
  if (!foundList) {
    const new_list = new List ({
      name: customList,
      items: defaultItems
    });
    
    new_list.save();
    res.redirect("/"+customList);
  }else{
    res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
  }
});


app.listen(port, function() {
  console.log(`http://localhost:${port}`);
});
