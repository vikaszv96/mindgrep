const family =  require('../models/family');
const prompt = require('prompt');
var fs = require('fs'), path = require('path');
prompt.start();
const readline = require('readline');

var inputName, inputRelationship;
var l, motherName, add_child;

prompt.get(['Enter_the_file_path'], function (err, result) {
    if (err) { return onErr(err); }
    console.log('Command-line input received:');
    console.log('=====================================================');

    var filePath = path.join(__dirname, result.Enter_the_file_path);
    processLineByLine(result.Enter_the_file_path);

});

function onErr(err) {
    console.log(err);
    return 1;
}

async function processLineByLine(args) {
  const fileStream = fs.createReadStream(args);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  // Note: we use the crlfDelay option to recognize all instances of CR LF
  // ('\r\n') in input.txt as a single line break.
 var lineArr = [];
  for await (const line of rl) {
    // Each line in input.txt will be successively available here as `line`.
    lineArr.push(line);
  }
  for (var i=0;i<lineArr.length;i++)
  {
    var str = lineArr[i].trim().split(' ');

    if(str[0] == 'ADD_CHILD')
    {
      motherName = str[1];
     var childName = str[2];
     var childGender = str[3];
      // console.log("str[1] = "+motherName);
      //  console.log("str[2] = "+childName);
      //  console.log("str[3] = "+childGender);

      const display7 = (person7) => {
     if(person7.wife == motherName)
     {
       var gen = ++ person7.generation.val;
       //console.log(childGender);
       if(childGender == 'Female')
       {
         //console.log(childGender);
        add_child =   {
           name: childName,
           type:String,
           gender:childGender,
           generation:{
           type:Number,
           val:gen
         },
         grandfather:person7.father,
         grandmother:person7.mother,
         father:person7.name,
         mother:motherName,
         husband:'',
         }
       }
         else if(childGender == 'Male'){
           add_child =   {
               name: childName,
               type:String,
               gender:childGender,
               generation:{
               type:Number,
               val:gen
             },
             grandfather:person7.father,
             grandmother:person7.mother,
             father:person7.name,
             mother:motherName,
             wife:'',
             }
         }
       }
       else if(person7.name == motherName)
       {
         var gen = ++ person7.generation.val;
         //console.log(childGender);
         if(childGender == 'Female')
         {
           //console.log(childGender);
          add_child =   {
             name: childName,
             type:String,
             gender:childGender,
             generation:{
             type:Number,
             val:gen
           },
           grandfather:person7.father,
           grandmother:person7.mother,
           father:person7.husband,
           mother:motherName,
           husband:'',
           }
         }
           else if(childGender == 'Male'){
             add_child =   {
                 name: childName,
                 type:String,
                 gender:childGender,
                 generation:{
                 type:Number,
                 val:gen
               },
               grandfather:person7.father,
               grandmother:person7.mother,
               father:person7.husband,
               mother:motherName,
               wife:'',
               }
           }
         }
     if (person7.children) {
       person7.children.forEach(display7);
     }
     }
        await display7(family.familyHead);
        await displayAdd(family.familyHead);
        //console.log("family.familyHead after addition = "+ JSON.stringify(family.familyHead));
        // console.log("add_child = "+ JSON.stringify(add_child));
    }
    else if(str[0] == 'GET_RELATIONSHIP'){
      inputName = str[1];
      inputRelationship = str[2];
      await display(family.familyHead);
    }
  }
}

const displayAdd = (object) => {
 if(object.wife == motherName || object.name == motherName)
 {
   object.children.push(add_child);
   console.log('CHILD_ADDITION_SUCCEEDED');
 }
if (object.children) {
 object.children.forEach(displayAdd);
}
}

// ADD_CHILD Chitra Aria Female
// GET_RELATIONSHIP Lavnya Maternal-Aunt
// GET_RELATIONSHIP Aria Siblings

const display = (person) => {
if((person.name == inputName) && (inputRelationship == "Paternal-Uncle" || inputRelationship == "Maternal-Uncle" || inputRelationship == "Paternal-Aunt" || inputRelationship == "Maternal-Aunt"))
{
   var genID = person.generation.val, arr = [];
   --genID;
   const display2 = (person2) => {
  if(person2.generation.val == genID && person2.father == person.grandfather && person2.mother == person.grandmother)
  {
    arr.push(person2);
  }
  if (person2.children) {
    person2.children.forEach(display2);
  }
}
display2(family.familyHead);
l = arr.length;

if(inputRelationship == "Paternal-Uncle" || inputRelationship == "Paternal-Aunt" )
{
  arr.forEach(item => {
    if(person.father == item.name)
    {
      const index = arr.indexOf(item);
      if (index > -1) {
        arr.splice(index, 1);
      }
    }
  });
}
if(inputRelationship == "Maternal-Uncle" || inputRelationship == "Maternal-Aunt")
{
  arr.forEach(item => {
    if(person.mother == item.name)
    {
      const index = arr.indexOf(item);
      if (index > -1) {
        arr.splice(index, 1);
      }
    }
  });
}

var maleARR = [], femaleARR = [];
arr.forEach(ele => {
  if(ele.gender == 'Male')
  {
    maleARR.push(ele);
   }
   else if(ele.gender == 'Female')
   {
     femaleARR.push(ele);
   }
})
if(l == arr.length)
console.log("None");
else if(inputRelationship == "Maternal-Uncle" || inputRelationship == "Paternal-Uncle"){
  var strUncle = "";
maleARR.forEach(item => {
  strUncle += item.name + " ";
})
if(strUncle != '')
console.log(strUncle);
else
console.log('None');
}
else if(inputRelationship == "Maternal-Aunt" || inputRelationship == "Paternal-Aunt"){
  var strAunt = "";
  femaleARR.forEach(item => {
    strAunt += item.name + " ";
  })
  console.log(strAunt);
}
}
 else if((person.name == inputName) && (inputRelationship == "Son" || inputRelationship == "Daughter"))
 {
   var arr = [];
  genID = ++person.generation.val;
  const display3 = (person3) => {
 if(person3.generation.val == genID && (person3.father == person.name || person3.mother == person.name))
 {
   arr.push(person3);
 }
 if (person3.children) {
   person3.children.forEach(display3);
 }
}
display3(family.familyHead);
var sonArr = [], daughtArr = [];
arr.forEach(item => {
  if(item.gender == 'Male')
  sonArr.push(item);
  else
  daughtArr.push(item);
})

if(inputRelationship == 'Son')
{
  var strSon = "";
  sonArr.forEach(item => {
    strSon += item.name + " ";
  })
  if(strSon != '')
  console.log(strSon);
 else
 console.log('None');
}
else if(inputRelationship == 'Daughter'){
  var strDaughter = "";
  daughtArr.forEach(item => {
    strDaughter += item.name + " ";
  })
  if(strDaughter != '')
  console.log(strDaughter);
 else
 console.log('None');
}
else {
  console.log('No Person Exist');
}
}
else if((person.name == inputName) && (inputRelationship == "Siblings"))
{
  var arr = [];
 genID = person.generation.val;
 const display4 = (person4) => {
if(person4.generation.val == genID && (person4.father == person.father && person4.mother == person.mother))
{
   arr.push(person4);
}
if (person4.children) {
  person4.children.forEach(display4);
}
}
display4(family.familyHead);

arr.forEach(item => {
  if(person.name == item.name)
  {
    const index = arr.indexOf(item);
    if (index > -1) {
      arr.splice(index, 1);
    }
  }
});

var strSib = "";
arr.forEach(item => {
  strSib += item.name + " ";
})
if(strSib != '')
 console.log(strSib);
 else
console.log('None');
}
else if(inputRelationship == "Sister-In-Law" || inputRelationship == "Brother-In-Law")
{

  if(person.name == inputName)
  {
    genID = person.generation.val;
    var arr = [];
    const display5 = (person5) => {
   if(person5.generation.val == genID && (person5.father == person.father && person5.mother == person.mother))
   {
     arr.push(person5);
   }
   if (person5.children) {
     person5.children.forEach(display5);
   }
   }
   display5(family.familyHead);
   arr.forEach(item => {
     if(person.name == item.name)
     {
       const index = arr.indexOf(item);
       if (index > -1) {
         arr.splice(index, 1);
       }
     }
   });
   var arrSIL = [], arrBIL = [];
     arr.forEach(item => {
       if(item.gender == 'Male')
       arrSIL.push(item.wife)
       else if(item.gender == 'Female')
       arrBIL.push(item.husband)
     })
     if(inputRelationship == "Sister-In-Law")
     {
       var strSIL = "";
       arrSIL.forEach(item => {
         strSIL += item + " ";
       })
       if(strSIL != '')
        console.log(strSIL);
        else
       console.log('None');
     }
     else if(inputRelationship == "Brother-In-Law")
     {
       var strBIL = "";
       arrBIL.forEach(item => {
         strBIL += item + " ";
       })
       if(strBIL != '')
        console.log(strBIL);
        else
       console.log('None');
     }
  }
  else if(person.wife == inputName || person.husband == inputName)
  {
    genID = person.generation.val;
    var arr = [];
    const display6 = (person6) => {
   if(person6.generation.val == genID && (person6.father == person.father && person6.mother == person.mother))
   {
     arr.push(person6);
   }
   if (person6.children) {
     person6.children.forEach(display6);
   }
   }
   display6(family.familyHead);
   arr.forEach(item => {
     if(person.wife == item.wife || person.husband == item.husband)
     {
       const index = arr.indexOf(item);
       if (index > -1) {
         arr.splice(index, 1);
       }
     }
   });

   var arrSIL = [], arrBIL = [];
     arr.forEach(item => {
       if(item.gender == 'Male')
       arrBIL.push(item)
       else if(item.gender == 'Female')
       arrSIL.push(item)
     })
     if(inputRelationship == "Sister-In-Law")
     {
       var strSIL = "";
       arrSIL.forEach(item => {
         strSIL += item.name + " ";
       })
       console.log(strSIL);
       if(strSIL != '')
        console.log(strSIL);
        else
       console.log('None');
     }
     else if(inputRelationship == "Brother-In-Law")
     {
       var strBIL = "";
       arrBIL.forEach(item => {
         strBIL += item.name + " ";
       })
       console.log(strBIL);
       if(strBIL != '')
        console.log(strBIL);
        else
       console.log('None');
     }
  }
}
  if (person.children) {
    person.children.forEach(display)
  }
}
