// external js: flickity.pkgd.js

var carousel = document.querySelector('.carousel');
var imgs = carousel.querySelectorAll('.carousel-cell img');
var docStyle = document.documentElement.style;
var transformProp = typeof docStyle.transform == 'string' ?
'transform' : 'WebkitTransform';
$(document).ready(function(){
    $('.carousel').flickity({
    imagesLoaded: true,
    percentPosition: false,
    autoPlay: 1500,
    pauseAutoPlayOnHover: false,
    pageDots: false,
    prevNextButtons: false,
    draggable: true,
    freeScroll: true,
    adaptiveHeight: true,
    wrapAround: true,
    initialIndex: 3,
    freeScrollFriction: 0.03
    });

    $('.carousel-cell').click(function(){
        var index = $(this).index();
        $('.carousel').flickity( 'select', index );
    });

    $('.carousel').on( 'select.flickity', function() {
        // set imageData
        var index = $('.carousel').flickity('selectedIndex');
        var img = imgs[index];
        var cellElem = carousel.querySelector('.is-selected');
        var flickity = carousel.flickity.data('flickity');
        var x = ( cellElem.offsetWidth + flickity.cellAlign ) * flickity.selectedIndex;
        var halfImgWidth = img.offsetWidth / 2;
        var moveX = x - halfImgWidth;
        // reset transform
        carousel.style[ transformProp ] = 'translateX(0)';
        // set transform
        carousel.style[ transformProp ] = 'translateX(' + moveX + 'px)';
    }

    );

});

if ("webkitSpeechRecognition" in window) {
    // Initialize webkitSpeechRecognition
    let speechRecognition = new webkitSpeechRecognition();

    // String for the Final Transcript
    let final_transcript = "";

    // Set the properties for the Speech Recognition object
    speechRecognition.continuous = true;
    speechRecognition.interimResults = true;
    speechRecognition.lang = 'en-US';

    // Callback Function for the onStart Event
    speechRecognition.onstart = () => {
        // Show the Status Element
        document.querySelector("#status").style.display = "block";
    };
    speechRecognition.onerror = () => {
        // Hide the Status Element
        document.querySelector("#status").style.display = "none";
    };
    speechRecognition.onend = () => {
        // Hide the Status Element
        document.querySelector("#status").style.display = "none";
    };

    speechRecognition.onresult = (event) => {
        // Create the interim transcript string locally because we don't want it to persist like final transcript
        let interim_transcript = "";

        // Loop through the results from the speech recognition object.
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            // If the result item is Final, add it to Final Transcript, Else add it to Interim transcript
            if (event.results[i].isFinal) {
                final_transcript += event.results[i][0].transcript;
            } else {
                interim_transcript += event.results[i][0].transcript;
            }
        }

        // combine final and interim transcript
        newTranscript = final_transcript + interim_transcript;
    };

    // Set the onClick property of the start button
    document.querySelector("#start").onclick = () => {
        // Start the Speech Recognition
        var doc = document.getElementById("final").value;
        document.getElementById("final").value = "";
        speechRecognition.start();

        // timeout funciton 5 seconds
        setTimeout(function () {
            speechRecognition.stop();
            newTranscript = newTranscript.replace(doc, "");
            document.querySelector("#final").value = newTranscript;
        }, 5000);
    };
}
else {
    console.log("Speech Recognition Not Available");
}





