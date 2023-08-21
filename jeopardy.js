//wait for the DOM to be loaded on click and then call the board setup in setupAndStart
$(document).ready(function() {
    $('#start').on('click', setupAndStart);
});

    const NUM_CATEGORIES = 6;
    let categories = [];
    let questions = [];
    NUM_QUESTIONS_PER_CATEGORY = 5;

//
//    let categories = [];
//    let questions = [];
//});

// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]
//1.  The top tables are created but not populated../
function populateBoard() {  
    const $thead = $("#jeopardy thead");  //select thead and tbody and put in a const
    const $tbody = $("#jeopardy tbody");

   
    $tbody.empty();


    let $tr = $("<tr>");
    for (let cat of categories) {  //loop over the categories array
    $tr.append($("<th>").text(cat.title)); 
    //append the tr to th and add the titles of each category
}
$thead.append($tr);  //$tr added as a child element of $thead...

//adding this loop AND defining NUM_QUESTIONS_PER_CATEGORY made it work....
for (let i = 0; i < NUM_QUESTIONS_PER_CATEGORY; i++) {
    let $tr = $("<tr>");
    for (let j = 0; j < NUM_CATEGORIES; j++) {
        $tr.append($("<td>").addClass("clue"));
    }
    $tbody.append($tr);
}

$('.clue').on('click', handleClick); 
}

async function getCategoryIds(count) {
    const response = await $.ajax({
        url: `https://jservice.io/api/categories?count=${count}`,
        method: 'GET'    
        //datatype: JSON,
        //jsonp: 'callback'
    });
    return response.map(category => category.id);
}
async function getCategory(catId) {
    return await $.ajax({
        url: `https://jservice.io/api/clues?category=${catId}`,
        method: 'GET'
    });
    
}

async function fillTable() {
     categories = await getCategoryIds(NUM_CATEGORIES);  //categories used as a GLOBAL VARIABLE....
     populateBoard();
    const categoryPromises = categories.map(catId => getCategory(catId));
    const responses = await Promise.all(categoryPromises);
    //responses.forEach(response => questions.push(...response));
    questions = responses.flat();   //GLOBAL VARIABLE
    
}

//*Here, Promise.all() is a utility function in JavaScript that takes an array of promises and returns a new 
//promise that resolves to an array of resolved values from the original promises, in the same order. 
//In other words, it waits for all the promises in the array to complete and then returns an array of their results.

function handleClick(evt) {
    const $cell = $(evt.target);
    const rowIndex = $cell.parent().index();
    const colIndex = $cell.index();

    if ($cell.hasClass('clue')) {
        $cell.text(questions[colIndex + rowIndex * NUM_CATEGORIES].question); //.question is referring to the object element question
        $cell.removeClass('clue').addClass('question');
    } else if ($cell.hasClass('question')) {
        $cell.text(questions[colIndex + rowIndex * NUM_CATEGORIES].answer); 
        $cell.removeClass('question').addClass('answer');
    }
}

function showLoadingView() {
    $("#spin-container").show(); // Show loading spinner
    $("#start").addClass("disabled").text("Loading..."); 
}

function hideLoadingView() {
$("#start").removeClass("disabled").text("Restart!"); // Enable the start button
$("#spin-container").hide(); 
}

async function setupAndStart() {
    showLoadingView();
    await fillTable();
    //const categories = await getCategoryIds(NUM_CATEGORIES);
    //populateBoard(categories);
    hideLoadingView();
}
