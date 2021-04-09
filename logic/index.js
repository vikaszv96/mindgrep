  const family =  require('../models/family');
  const prompt = require('prompt');
  const fs = require('fs'), path = require('path');
  const readline = require('readline');

  var inputName, inputRelationship, l, motherName, add_child;
  prompt.start();

  prompt.get(['Enter_the_file_path'], function (err, result) { //Taking the input of url from the user
    if (err) {
      return console.log(err);
    }
    console.log('Command-line input received:');
    console.log('=====================================================');

    var filePath = path.join(__dirname, result.Enter_the_file_path);
    processLineByLine(filePath);
  });
  async function processLineByLine(args) { //processing one line separately from whole para in .txt file
    const fileStream = fs.createReadStream(args);

    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });
    // Note: we use the crlfDelay option to recognize all instances of CR LF
    // ('\r\n') in input.txt as a single line break.
    var linefamilyTree = [];
    for await (const line of rl) {
      // Each line in input.txt will be successively available here as `line`.
      linefamilyTree.push(line);
    }
    await performOperations(linefamilyTree);
  }

  async function performOperations (linefamilyTree){ //add child to the family tree and get relationship
    for (var i=0;i<linefamilyTree.length;i++){
      var str = linefamilyTree[i].trim().split(' '); //Taking first word as input from respective line
      if(str[0] == 'ADD_CHILD')  { //calling addchild function to initialize child object
        addChildOperation(str);
      }
      else if(str[0] == 'ADD_WIFE')  {
        addWifeOperation(str);
      }
      else if(str[0] == 'ADD_HUSBAND')  {
        addHusbandOperation(str);
      }
      else if(str[0] == 'GET_RELATIONSHIP') {
        inputName = str[1];
        inputRelationship = str[2];
        await displayRelationship(family.familyHead);
      }
    }
  }

  async function addChildOperation(str){  //assigning and sending parameters to childobject before addChild
    motherName = str[1];
    var childName = str[2];
    var childGender = str[3];

    const display = async(person) => {
      if(person.wife.name == motherName){
        if(childGender == 'Female' || person.name == motherName)
        await addChildObject(person, motherName, childName, childGender, 'husband');
        else if(childGender == 'Male')  {
          await addChildObject(person, motherName, childName, childGender, "wife");
        }
      }
      if (person.children) {
        person.children.forEach(display);
      }
    }
    await display(family.familyHead);
    await displayAddChild(family.familyHead);
  }
  async function addWifeOperation(str){  //assigning and sending parameters to wifebject before addWife
    var husbandName = str[1];
    var wifeName = str[2];
    const display = async(person) => {
      if(person.name == husbandName) {
        var wife = {
          name:wifeName,
          husband:husbandName,
          fil:person.father,
          mil:person.mother,
          children : []
        }
        person.wife = wife;
      }
      if (person.children) {
        person.children.forEach(display);
      }
    }
    await display(family.familyHead);
  }
  async function addHusbandOperation(str){  //assigning and sending parameters to husbandobject before addHusband
    var husbandName = str[2];
    var wifeName = str[1];
    const display = async(person) => {
      if(person.name == wifeName) {
        var husband = {
          name:husbandName,
          wife:wifeName,
          fil:person.father,
          mil:person.mother,
        }
        person.husband = husband;
      }
      if (person.children) {
        person.children.forEach(display);
      }
    }
    await display(family.familyHead);
  }

  async function addChildObject(person, motherName, childName, childGender, spouse){
    if(spouse == 'husband')
    add_child =   { //Initializing the child object before adding to the tree
      name: childName,
      gender:childGender,
      grandfather:person.wife.fil,
      grandmother:person.wife.mil,
      father:person.wife.husband,
      mother:motherName,
      [spouse]:'',
      children:[]
    }
    else
    add_child =   { //Initializing the child object before adding to the tree
      name: childName,
      gender:childGender,
      grandfather:person.wife.fil,
      grandmother:person.wife.mil,
      father:person.wife.husband,
      mother:motherName,
      wife: {
        name:'',
        husband:'',
        fil:'',
        mil:'',
        children : []
      }
    }
  }

  const displayAddChild = async(object) => { //Add child from mother's name
    if(object.wife == motherName || object.name == motherName){
      await object.children.push(add_child);
      console.log('CHILD_ADDITION_SUCCEEDED');
    }
    if (object.children) {
      object.children.forEach(displayAddChild);
    }
  }
  const displayRelationship = async(person) => { //Get Relationship
    var familyTree;
    if(inputRelationship == "Paternal-Uncle" || inputRelationship == "Maternal-Uncle"
    || inputRelationship == "Paternal-Aunt" || inputRelationship == "Maternal-Aunt") {
      if(person.name == inputName) {
        var father = person.father, mother = person.mother;
        familyTree = await getUncleAndAunt(person); //familyTreeay for all uncle and aunt storing
        familyTree = await getPaternalAndMaternal(familyTree, father, mother); //familyTreeay for all uncle and aunt storing

        const male = await familyTree.filter(async(uncle) => {uncle.gender === 'male'}); //filtered all uncle either maternal or paternal in one stack
        const female = await familyTree.filter(async(aunt) => {aunt.gender === 'female'}); //filtered all aunt either maternal or paternal in one stack

        if(l == familyTree.length)
        console.log("None");
        else if(inputRelationship == "Maternal-Uncle" || inputRelationship == "Paternal-Uncle")
        await printPerson(male); //calling to print the uncle
        else if(inputRelationship == "Maternal-Aunt" || inputRelationship == "Paternal-Aunt")
        await printPerson(female); //calling to print the aunt
      }
      else if(person.wife) {
        if(person.wife.name == inputName)
        console.log('None');
      }
      else if(person.husband) {
        if(person.husband == inputName)
        console.log('None');
      }
    }

    else if(inputRelationship == "Son" || inputRelationship == "Daughter")
    {
      if(person.name == inputName){
        callSonAndDaughter(person.name);
      }
      else if(person.wife) {
        if(person.wife.name == inputName)
        console.log('None');
      }
      else if(person.husband) {
        if(person.husband == inputName)
        console.log('None');
      }
    }

    else if(inputRelationship == "Siblings") {
      if(person.name == inputName) {
        familyTree = await getSiblings(person);
        familyTree = await removePerson(familyTree, inputName);
        await printPerson(familyTree);
      }
      else if(person.wife) {
        if(person.wife.name == inputName)
        console.log('None');
      }
      else if(person.husband) {
        if(person.husband == inputName)
        console.log('None');
      }
    }

    else if(inputRelationship == "Sister-In-Law" || inputRelationship == "Brother-In-Law") {
      if(person.name == inputName) {
        callSILAndBIL(person);
      }
      else if(person.wife || person.husband) {
        if(person.wife.name == inputName || person.husband == inputName) {
          callSILAndBIL(person);
        }
      }
    }
    if (person.children) {
      person.children.forEach(displayRelationship)
    }
  }

  async function getUncleAndAunt(person){ //get all uncle and aunt of same generation
    var grandMother = person.grandmother || person.mil, familyTree = [];
    const display = async(person) => {
      if(person.name == grandMother){
        await familyTree.push(person.children);
      }
      else if(person.wife.name == grandMother)
      await familyTree.push(person.wife.children);

      if (person.children) {
        person.children.forEach(display);
      }
    }
    await display(family.familyHead);
    return familyTree;
  }
  async function getPaternalAndMaternal(familyTree, father, mother) { //get all paternal uncle and aunt
    familyTree.forEach(async(item) => {
      if(father == item.name || mother == item.name){
        const index = await familyTree.indexOf(item);
        if (index > -1) {
          familyTree.splice(index, 1);
        }
      }
    });
    return familyTree;
  }

  async function callSonAndDaughter(name) {
    familyTree = await getSonAndDaughter(name);
    const male = await familyTree.filter(async(son) => {son.gender === 'male'});
    const female = await familyTree.filter(async(daughter) => {daughter.gender === 'female'});

    if(inputRelationship == 'Son')
    await printPerson(male);
    else if(inputRelationship == 'Daughter')
    await printPerson(female);
    else
    console.log('No Person Exist');
  }
  async function getSonAndDaughter(person){ //get all son and daughter together and store in a stack
    var familyTree = [];
    const display3 = async(person3) => {
      if (person3.wife.name == name){
        await familyTree.push(person3.wife.children);
      }
      else if(person3.name == name || person3.husband == name) {
        await familyTree.push(person3.children);
      }
      if (person3.children) {
        person3.children.forEach(display3);
      }
    }
    await display3(family.familyHead);
    return familyTree;
  }

  async function getSiblings(person){ //get all siblings
    var familyTree = [];
    const display4 = async(person4) => {
      if(person4.father == person.father && person4.mother == person.mother){
        await familyTree.push(person4);
      }
      if (person4.children) {
        person4.children.forEach(display4);
      }
    }
    await display4(family.familyHead);
    return familyTree;
  }

  async function callSILAndBIL(person) {
    var persons = person;
    familyTree = await getAllBILandSIL(person);
    familyTree = await filterAllBILandSIL(familyTree, persons);

    const male = await familyTree.filter(async(bil) => {bil.gender === 'Male'});
    const female = await familyTree.filter(async(sil) => {sil.gender === 'Female'});

    if(inputRelationship == "Sister-In-Law")
    await printPersonBILandSIL(female);
    else if(inputRelationship == "Brother-In-Law")
    await printPersonBILandSIL(male);
  }
  async function getAllBILandSIL(person){ //get all BIL and SIL together in a stack
    var familyTree = [];
    const display5 = async(person5) => {
      if(person5.name == person.father)
      await familyTree.push(person5.wife.children);

      else if(person5.name == person.mother)
      await familyTree.push(person5.children);

      if (person5.children) {
        person5.children.forEach(display5);
      }
    }
    await display5(family.familyHead);
    return familyTree;
  }
  async function filterAllBILandSIL(familyTree, persons){ //remove himself/herfelf while counting
    familyTree.forEach(async(item) => {
      if(persons.name == item.name || persons.wife.name == item.name){
        const index = await familyTree.indexOf(item);
        if (index > -1) {
          familyTree.splice(index, 1);
        }
      }
    })
    return familyTree;
  }

  async function removePerson(familyTree, name){ //remove himself/herfelf in siblings
    familyTree.forEach(async(item) => {
      if(name == item.name) {
        const index = await familyTree.indexOf(item);
        if (index > -1) {
          familyTree.splice(index, 1);
        }
      }
    });
    return familyTree;
  }
  async function printPerson(person){ //print all maternal or paternal uncle
    var str = "";
    person.forEach(async(item) => {
      str += item.name + " ";
    })
    if(str != '')
    console.log(str);
    else
    console.log('None');
  }

  async function printPersonBILandSIL(person){ //print all maternal or paternal uncle
    var str = "", spouseName;
    if(person.gender == 'male')
    spouseName = person.wife.name;
    else
    spouseName = person.name;

    person.forEach(async(item) => {
      str += spouseName + " ";
    })
    if(str != '')
    console.log(str);
    else
    console.log('None');
  }
