//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
// const date = require(__dirname + "/date.js");
const app = express();
const _ = require("lodash");

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb+srv://admin-kirti:Test123@cluster0.b6006u7.mongodb.net/todolistDB');
}

const itemsSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemsSchema);

// const item1 = new Item({
//   name: "Welcome to your todolist!"
// });

// const item2 = new Item({
//   name: "Hit the + button to add a new item."
// });

// const item3 = new Item({
//   name: "<-- Hit this to delete an item."
// });

// const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

// async function insertData(){
//   try{
//     await Item.insertMany(defaultItems);
//     console.log("Successfully saved default items into DB.")
//     }
//   catch(e){
//     console.log(e.message);
//   }
// }

app.get("/", function(req, res){
  findItems().catch(e => console.log(e.message));
  async function findItems(){
    const foundItems = await Item.find({});
    // if(foundItems.length === 0){
    //   insertData();
    //   res.redirect("/");
    // } 
    // else{
    //   res.render("list", {listTitle: "Today", newListItems: foundItems});
    // }
    res.render("list", {listTitle: "Today", newListItems: foundItems});
  }
});

app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);

  findListTitle();
  async function findListTitle(){
    try{
      const foundList = await List.findOne({name: customListName});
      if(!foundList){
        const list = new List({
          name: customListName,
          // items: defaultItems
        });
      
        list.save();
        res.redirect("/" + customListName);
      }
      else{
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
      // res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
    }
    catch(e){
      console.log(e.message);
    }
  }
});


app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }
  else{
    findTitle().catch(e => console.log(e.message));
    async function findTitle(){
      const foundList = await List.findOne({name: listName});
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    }
  }
});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    removeDefault().catch(e => console.log(e.message));
    async function removeDefault(){
      await Item.deleteOne({_id: checkedItemId});
      console.log("Successfully deleted checked item.");
      res.redirect("/");
    }
  }
  else{
    findUpdate().catch(e => console.log(e.message));
    async function findUpdate(){
      const foundList = await List.findOneAndUpdate({name: listName}, 
        {$pull: {items: {_id: checkedItemId}}});
      res.redirect("/" + listName);
    }
  }
});


app.listen(3000, function(){
  console.log("server started on port 3000");
}); 